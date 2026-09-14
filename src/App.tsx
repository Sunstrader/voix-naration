import React, { useRef, useState } from 'react';
import { Volume2, RefreshCw, AlertCircle } from 'lucide-react';
import { DEFAULT_TTS_DIRECTIVES } from './constants';
import { VoiceSelector } from './components/VoiceSelector';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { NarrationSettings } from './components/NarrationSettings';

export default function App() {
  const [text, setText] = useState('');
  const [directives, setDirectives] = useState(DEFAULT_TTS_DIRECTIVES);
  const [voice, setVoice] = useState('Charon');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState<{ url: string; voice: string; duration: number } | null>(null);
  const pending = useRef(false);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  // No mount effect, shared text cache or persistent browser storage.
  // Only this explicit user action sends text to the generation service.
  async function generateNarration() {
    if (!text.trim() || pending.current) return;
    pending.current = true;
    setIsLoading(true);
    setError(null);
    setRecording(null);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 180000);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName: voice, customInstructions: directives }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.audioDataUrl) {
        throw new Error(data.error || 'La génération a échoué. Réessayez.');
      }
      setRecording({ url: data.audioDataUrl, voice: data.voice || voice, duration: data.durationEstimateSeconds || 0 });
    } catch (err) {
      setError(err instanceof Error && err.name === 'AbortError'
        ? 'La génération a pris trop de temps. Essayez un texte plus court.'
        : err instanceof Error ? err.message : 'Impossible de générer cet audio.');
    } finally {
      window.clearTimeout(timeout);
      pending.current = false;
      setIsLoading(false);
    }
  }

  function clearContent() {
    setText('');
    setRecording(null);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-7">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Atelier vocal</h1>
          <p className="text-neutral-400">Transformez votre texte en audio. Choisissez une voix, ajustez le ton, puis téléchargez votre enregistrement.</p>
        </header>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-3">
          <div className="flex justify-between items-center gap-4">
            <label htmlFor="narration-text" className="font-semibold">Votre texte</label>
            <button type="button" onClick={clearContent} disabled={isLoading || (!text && !recording)}
              className="text-sm text-neutral-400 hover:text-white disabled:opacity-40">Effacer le texte et l’audio</button>
          </div>
          <textarea id="narration-text" value={text} disabled={isLoading} rows={9} maxLength={12000}
            onChange={(event) => { setText(event.target.value); setRecording(null); setError(null); }}
            placeholder="Écrivez ou collez votre texte ici…"
            className="w-full rounded-xl bg-neutral-950 border border-neutral-700 p-4 leading-relaxed focus:outline-none focus:border-amber-400 resize-y" />
          <div className="flex justify-between text-xs text-neutral-400">
            <span>{wordCount} mots</span><span>{text.length} / 12 000 caractères</span>
          </div>
          <p className="text-xs text-neutral-400">Le texte est envoyé à Google uniquement lorsque vous lancez la génération. Il n’est pas enregistré dans cette application et disparaît à l’actualisation.</p>
        </section>

        <VoiceSelector selectedVoiceId={voice} disabled={isLoading}
          onSelectVoice={(value) => { setVoice(value); setRecording(null); }} />
        <NarrationSettings directives={directives} disabled={isLoading}
          onChangeDirectives={(value) => { setDirectives(value); setRecording(null); }} />

        {error && <div role="alert" className="rounded-xl border border-rose-800 bg-rose-950/40 p-4 text-rose-200 flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />{error}
        </div>}

        <button type="button" onClick={generateNarration} disabled={isLoading || !text.trim()}
          className="px-6 py-3 rounded-xl bg-amber-400 text-neutral-950 font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-300">
          {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
          {isLoading ? 'Génération en cours…' : 'Générer l’audio'}
        </button>
        <AudioPlayerBar audioUrl={recording?.url || null} voiceName={recording?.voice || voice}
          durationEstimate={recording?.duration || 0} onTimeUpdate={() => {}} onEnded={() => {}} />
        <footer className="text-xs text-neutral-500 border-t border-neutral-800 pt-5">
          Atelier vocal · 30 voix · Téléchargement WAV
        </footer>
      </main>
    </div>
  );
}
