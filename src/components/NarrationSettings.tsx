import React, { useState } from 'react';
import { Sliders, RotateCcw, ChevronDown, ChevronUp, Sparkles, ShieldCheck } from 'lucide-react';
import { DEFAULT_TTS_DIRECTIVES, MYSTIC_TTS_DIRECTIVES } from '../constants';

interface NarrationSettingsProps {
  directives: string;
  onChangeDirectives: (directives: string) => void;
  disabled?: boolean;
}

export const NarrationSettings: React.FC<NarrationSettingsProps> = ({
  directives,
  onChangeDirectives,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const resetToDefault = () => {
    onChangeDirectives(DEFAULT_TTS_DIRECTIVES);
  };

  const presetThemes = [
    {
      name: 'Livre Audio Fantasy (Par défaut)',
      prompt: DEFAULT_TTS_DIRECTIVES,
    },
    {
      name: 'Givre & Silence Mystique',
      prompt:
        MYSTIC_TTS_DIRECTIVES,
    },
    {
      name: 'Épique & Tragique',
      prompt:
        'Lis ce texte en français avec solennité et gravité shakespearienne, émotion contenue mais poignante, voix de vieux conteur témoin de la chute d’un empire. Voix seule sans artifice.',
    },
  ];

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 transition-all">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-200 group-hover:text-amber-300 transition flex items-center gap-2">
              <span>Directives Narratives & Consignes de Voix</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                Prompt TTS
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 line-clamp-1">
              {directives}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {directives !== DEFAULT_TTS_DIRECTIVES && (
            <button
              onClick={resetToDefault}
              disabled={disabled}
              title="Rétablir les directives par défaut"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 text-xs transition flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Rétablir</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-neutral-800/80 space-y-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-neutral-400 mr-1">Préréglages d'ambiance :</span>
            {presetThemes.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChangeDirectives(preset.prompt)}
                disabled={disabled}
                className="px-2.5 py-1 rounded-lg text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-amber-300 border border-neutral-700/60 transition"
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-amber-400/80 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Instructions envoyées au modèle Gemini TTS
            </label>
            <textarea
              value={directives}
              onChange={(e) => onChangeDirectives(e.target.value)}
              disabled={disabled}
              rows={4}
              className="w-full bg-neutral-950/90 border border-neutral-700/80 rounded-xl p-3 text-xs text-neutral-300 font-sans focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 leading-relaxed resize-y"
              placeholder="Consignes de voix, débit, émotion..."
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-400 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              Les consignes demandent une voix seule, naturelle, sans musique ni bruitage, avec respect strict du texte.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
