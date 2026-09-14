import React from 'react';
import { Sparkles, Check, Mic } from 'lucide-react';
import { VOICE_OPTIONS } from '../constants';
import { VoiceOption } from '../types';

interface VoiceSelectorProps {
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string) => void;
  disabled?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoiceId,
  onSelectVoice,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5 font-mono">
          <Mic className="w-3.5 h-3.5 text-amber-400" />
          Voix du Narrateur (Modèle Gemini TTS)
        </label>
        <span className="text-[11px] text-neutral-400">{VOICE_OPTIONS.length} voix disponibles</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {VOICE_OPTIONS.map((voice: VoiceOption) => {
          const isSelected = selectedVoiceId === voice.id;
          return (
            <button
              key={voice.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectVoice(voice.id)}
              className={`group text-left p-3 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-950/50 ring-1 ring-amber-500/40'
                  : 'bg-neutral-900/60 border-neutral-800/80 hover:bg-neutral-850 hover:border-neutral-700 text-neutral-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-serif font-bold text-sm tracking-wide ${
                      isSelected ? 'text-amber-200' : 'text-neutral-100 group-hover:text-amber-300'
                    }`}
                  >
                    {voice.name}
                  </span>
                  {isSelected ? (
                    <span className="w-4 h-4 rounded-full bg-amber-500/30 text-amber-300 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                      Voix
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-medium text-amber-400/80 mb-1.5">
                  {voice.tone}
                </div>
              </div>
              <p className="text-[11px] text-neutral-400 leading-snug line-clamp-2">
                {voice.description}
              </p>
              {isSelected && (
                <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-amber-500/20 to-transparent pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
