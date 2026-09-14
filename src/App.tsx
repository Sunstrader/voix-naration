import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Volume2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Headphones,
  CheckCircle2,
  Compass,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  DEFAULT_FANTASY_TEXT,
  DEFAULT_TTS_DIRECTIVES,
  VOICE_OPTIONS,
} from './constants';
import { VoiceSelector } from './components/VoiceSelector';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { NarrativeManuscript } from './components/NarrativeManuscript';
import { NarrationSettings } from './components/NarrationSettings';

export default function App() {
  const [text, setText] = useState(DEFAULT_FANTASY_TEXT);
  const [directives, setDirectives] = useState(DEFAULT_TTS_DIRECTIVES);
  const [selectedVoiceId, setSelectedVoiceId] = useState('Charon');
  const [isEditingText, setIsEditingText] = useState(false);

  // Audio generation state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [durationEstimate, setDurationEstimate] = useState<number>(0);

  // Playback sync
  const [currentTime, setCurrentTime] = useState(0);
  const [activeDuration, setActiveDuration] = useState(0);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number | null>(null);

  // In-memory audio cache: key is `${voiceId}_${hashOfTextAndDirectives}`
  const [audioCache, setAudioCache] = useState<
    Record<string, { audioUrl: string; duration: number }>
  >({});

  // Parse paragraphs from text
  const paragraphs = useMemo(() => {
    return text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [text]);

  // Compute paragraph time proportions based on character length
  const paragraphRanges = useMemo(() => {
    const totalChars = paragraphs.reduce((acc, p) => acc + p.length, 0);
    if (totalChars === 0) return [];

    let accumulated = 0;
    return paragraphs.map((p) => {
      const startRatio = accumulated / totalChars;
      accumulated += p.length;
      const endRatio = accumulated / totalChars;
      return { startRatio, endRatio };
    });
  }, [paragraphs]);

  // Sync active paragraph based on playback time
  const handleTimeUpdate = useCallback(
    (curTime: number, dur: number) => {
      setCurrentTime(curTime);
      setActiveDuration(dur);

      if (dur <= 0 || paragraphRanges.length === 0) {
        setActiveParagraphIndex(null);
        return;
      }

      const ratio = curTime / dur;
      const index = paragraphRanges.findIndex(
        (range) => ratio >= range.startRatio && ratio < range.endRatio
      );

      setActiveParagraphIndex(index !== -1 ? index : ratio >= 0.98 ? paragraphRanges.length - 1 : 0);
    },
    [paragraphRanges]
  );

  const getCacheKey = (voice: string, txt: string, dir: string) => {
    return `${voice}__${txt.trim()}__${dir.trim()}`;
  };

  // Generate TTS
  const generateNarration = async (
    targetText = text,
    overrideVoice = selectedVoiceId
  ) => {
    setIsLoading(true);
    setLoadingStep("Génération de l'audio avec gemini-3.1-flash-tts-preview...");
    setError(null);

    const cacheKey = getCacheKey(overrideVoice, targetText, directives);
    if (audioCache[cacheKey]) {
      setAudioUrl(audioCache[cacheKey].audioUrl);
      setDurationEstimate(audioCache[cacheKey].duration);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: targetText,
          voiceName: overrideVoice,
          customInstructions: directives,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Échec de la génération audio TTS');
      }

      const newUrl = data.audioDataUrl;
      const newDuration = data.durationEstimateSeconds || 30;

      setAudioCache((prev) => ({
        ...prev,
        [cacheKey]: { audioUrl: newUrl, duration: newDuration },
      }));

      setAudioUrl(newUrl);
      setDurationEstimate(newDuration);
    } catch (err: unknown) {
      console.error('Erreur TTS:', err);
      const message =
        err instanceof Error ? err.message : 'Erreur lors de la communication avec le serveur TTS.';
      setError(message);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Auto-generate narration on initial mount
  useEffect(() => {
    generateNarration(DEFAULT_FANTASY_TEXT, 'Charon');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch voice & update audio if already cached
  const handleSelectVoice = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
    const cacheKey = getCacheKey(voiceId, text, directives);
    if (audioCache[cacheKey]) {
      setAudioUrl(audioCache[cacheKey].audioUrl);
      setDurationEstimate(audioCache[cacheKey].duration);
    }
  };

  // Read single paragraph
  const handleReadParagraph = async (index: number) => {
    const pText = paragraphs[index];
    if (!pText) return;
    setActiveParagraphIndex(index);
    await generateNarration(pText, selectedVoiceId);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-amber-800/40 selection:text-amber-100">
      {/* Background radial accent */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-amber-600/10 via-neutral-900/0 to-transparent blur-3xl opacity-70" />
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Top Header */}
        <header className="space-y-4 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
                <Compass className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[11px] font-mono tracking-widest uppercase text-amber-400/90 font-semibold block">
                  Livre Audio Fantasy • Narration Voix Seule
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-100 tracking-wide font-cinzel">
                  Chroniques du Givre et de l'Éveil
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 self-center sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono bg-neutral-900 border border-neutral-800 text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                gemini-3.1-flash-tts-preview
              </span>
            </div>
          </div>

          <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
            Lecture en français de France, posée et immersive, sans musique ni artifice.
            Le timbre du narrateur épouse la lenteur du dégel et le mystère de l'oubli.
          </p>
        </header>

        {/* Error banner if any */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-rose-200 text-sm flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <div className="font-semibold text-rose-300">Erreur de génération audio</div>
              <p className="text-xs text-rose-300/80">{error}</p>
            </div>
            <button
              onClick={() => generateNarration()}
              className="px-3 py-1 bg-rose-900/60 hover:bg-rose-900 text-rose-100 rounded-lg text-xs font-medium transition border border-rose-700/60"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Master Action Banner / Player Bar */}
        <section className="space-y-4">
          <AudioPlayerBar
            audioUrl={audioUrl}
            voiceName={selectedVoiceId}
            durationEstimate={durationEstimate}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setActiveParagraphIndex(null)}
          />

          {/* If audio not yet generated or needs refresh */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/90 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-neutral-200">
                  {audioUrl
                    ? 'Narration prête pour l’écoute'
                    : 'Générer l’enregistrement audio complet'}
                </div>
                <div className="text-[11px] text-neutral-400">
                  Voix sélectionnée :{' '}
                  <span className="text-amber-400 font-semibold">{selectedVoiceId}</span> • 129 mots
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => generateNarration()}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-neutral-950 font-semibold text-xs tracking-wide uppercase transition shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Création de la voix...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>
                      {audioUrl ? 'Régénérer la narration' : 'Lancer la narration audio'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Voice Selector */}
        <section>
          <VoiceSelector
            selectedVoiceId={selectedVoiceId}
            onSelectVoice={handleSelectVoice}
            disabled={isLoading}
          />
        </section>

        {/* Prompt / Narration Directives */}
        <section>
          <NarrationSettings
            directives={directives}
            onChangeDirectives={(newDirectives) => {
              setDirectives(newDirectives);
            }}
            disabled={isLoading}
          />
        </section>

        {/* Manuscript Section */}
        <section>
          <NarrativeManuscript
            paragraphs={paragraphs}
            activeParagraphIndex={activeParagraphIndex}
            onReadParagraph={handleReadParagraph}
            isEditing={isEditingText}
            onToggleEdit={() => setIsEditingText(!isEditingText)}
            rawText={text}
            onTextChange={setText}
            isLoading={isLoading}
          />
        </section>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-900 bg-neutral-950/80 py-6 text-center text-xs text-neutral-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500/80" />
            <span className="font-serif">Livre audio fantasy • Voix seule</span>
          </div>
          <div className="text-[11px] font-mono text-neutral-400">
            Alimenté par Google GenAI • Modèle TTS gemini-3.1-flash-tts-preview
          </div>
        </div>
      </footer>
    </div>
  );
}
