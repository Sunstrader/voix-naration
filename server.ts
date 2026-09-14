import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitDepth = 16): Buffer {
  if (pcmBuffer.length >= 4 && pcmBuffer.toString("ascii", 0, 4) === "RIFF") {
    return pcmBuffer;
  }
  const byteRate = (sampleRate * numChannels * bitDepth) / 8;
  const blockAlign = (numChannels * bitDepth) / 8;
  const dataSize = pcmBuffer.length;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF chunk descriptor
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt sub-chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitDepth, 34);

  // data sub-chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  pcmBuffer.copy(buffer, 44);
  return buffer;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

  let aiClient: GoogleGenAI | null = null;
  function getAi(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured.");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // API status
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasKey: Boolean(process.env.GEMINI_API_KEY),
      model: "gemini-3.1-flash-tts-preview",
    });
  });

  // TTS generation endpoint using gemini-3.1-flash-tts-preview
  app.post("/api/tts", async (req, res) => {
    try {
      const {
        text,
        voiceName = "Charon",
        customInstructions,
      } = req.body;

      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ error: "Le texte à lire est obligatoire." });
      }

      const defaultInstructions =
        "Lis ce texte en français de France, comme une narration de livre audio de fantasy. " +
        "Voix naturelle, posée et immersive. Débit légèrement lent, pauses souples entre les phrases, émotion retenue. " +
        "Évite le ton publicitaire et la diction mécanique. Dans les dialogues, adapte subtilement l’intention du personnage. " +
        "Respecte exactement le texte. Voix seule, sans musique ni bruitage.";

      const promptInstructions = customInstructions && customInstructions.trim()
        ? customInstructions.trim()
        : defaultInstructions;

      const prompt = `${promptInstructions}\n\nTexte :\n${text.trim()}`;

      const ai = getAi();
      const validVoices = ["Charon", "Fenrir", "Zephyr", "Kore", "Puck"];
      const selectedVoice = validVoices.includes(voiceName) ? voiceName : "Charon";

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const candidate = response.candidates?.[0];
      const audioPart = candidate?.content?.parts?.find(
        (part) => Boolean(part.inlineData?.data)
      );

      if (!audioPart || !audioPart.inlineData?.data) {
        console.error("No audio part found in response:", JSON.stringify(response, null, 2));
        return res.status(502).json({
          error: "Aucun flux audio retourné par le modèle Gemini TTS.",
          details: response.text || "Réponse vide",
        });
      }

      const rawBase64 = audioPart.inlineData.data;
      const rawBuffer = Buffer.from(rawBase64, "base64");
      const wavBuffer = pcmToWav(rawBuffer, 24000, 1, 16);
      const wavBase64 = wavBuffer.toString("base64");

      const estimatedDuration = rawBuffer.length / (24000 * 2); // 16-bit mono = 48,000 bytes/sec

      res.json({
        success: true,
        audioDataUrl: `data:audio/wav;base64,${wavBase64}`,
        voice: selectedVoice,
        textLength: text.length,
        durationEstimateSeconds: Math.round(estimatedDuration * 10) / 10,
      });
    } catch (err: unknown) {
      console.error("TTS generation error:", err);
      const message = err instanceof Error ? err.message : "Erreur inconnue lors de la génération audio.";
      res.status(500).json({
        error: message,
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
