import React from 'react';
import { BookOpen, Sparkles, Volume2, Edit3, Check } from 'lucide-react';

interface NarrativeManuscriptProps {
  paragraphs: string[];
  activeParagraphIndex: number | null;
  onReadParagraph?: (index: number) => void;
  isEditing: boolean;
  onToggleEdit: () => void;
  rawText: string;
  onTextChange: (text: string) => void;
  isLoading?: boolean;
}

export const NarrativeManuscript: React.FC<NarrativeManuscriptProps> = ({
  paragraphs,
  activeParagraphIndex,
  onReadParagraph,
  isEditing,
  onToggleEdit,
  rawText,
  onTextChange,
  isLoading = false,
}) => {
  return (
    <div className="relative rounded-3xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-xl p-6 sm:p-10 shadow-2xl shadow-black/90 overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-900/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Manuscript Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800/80 pb-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-amber-500/90 font-semibold">
              Prologue • Chroniques de l'Éveil
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-neutral-100 tracking-wide">
              Le Sifflement du Givre
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleEdit}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
              isEditing
                ? 'bg-amber-500 text-neutral-950 border-amber-400 font-semibold'
                : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border-neutral-700/80'
            }`}
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Terminer l'édition</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 text-neutral-400" />
                <span>Modifier le texte</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Manuscript Content */}
      {isEditing ? (
        <div className="space-y-3">
          <label className="text-xs text-neutral-400 block font-sans">
            Éditez le texte littéraire ci-dessous. Le narrateur lira fidèlement vos mots :
          </label>
          <textarea
            value={rawText}
            onChange={(e) => onTextChange(e.target.value)}
            rows={10}
            className="w-full bg-neutral-950/80 border border-neutral-700/90 rounded-2xl p-5 text-neutral-200 font-serif text-base sm:text-lg leading-relaxed focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40 resize-y"
            placeholder="Écrivez ou collez un texte de fantasy..."
          />
        </div>
      ) : (
        <div className="space-y-6 text-neutral-200 font-serif selection:bg-amber-900/40">
          {paragraphs.map((p, idx) => {
            const isActive = activeParagraphIndex === idx;
            const isFirst = idx === 0;

            return (
              <div
                key={idx}
                className={`relative group rounded-2xl p-4 sm:p-5 transition-all duration-300 border ${
                  isActive
                    ? 'bg-amber-950/25 border-amber-500/60 shadow-lg shadow-amber-950/30'
                    : 'bg-transparent border-transparent hover:bg-neutral-800/30 hover:border-neutral-800'
                }`}
              >
                {/* Paragraph indicator button */}
                {onReadParagraph && (
                  <button
                    onClick={() => onReadParagraph(idx)}
                    disabled={isLoading}
                    title="Écouter ce passage spécifiquement"
                    className="absolute -left-2 sm:-left-3 top-4 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-neutral-800 text-amber-400 hover:bg-amber-500 hover:text-neutral-950 border border-neutral-700 shadow-md"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <p
                  className={`text-base sm:text-lg sm:leading-loose leading-relaxed tracking-normal transition-colors ${
                    isActive ? 'text-amber-100 font-normal' : 'text-neutral-300'
                  }`}
                >
                  {isFirst ? (
                    <span>
                      <span className="float-left text-4xl sm:text-5xl font-bold font-serif leading-none pr-3 pt-1 text-amber-400 font-['Cinzel',serif]">
                        {p.charAt(0)}
                      </span>
                      {p.slice(1)}
                    </span>
                  ) : (
                    p
                  )}
                </p>

                {isActive && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-sans text-amber-400/80 uppercase tracking-wider font-semibold">
                    <Sparkles className="w-3 h-3 animate-pulse text-amber-400" />
                    <span>Passage en cours de lecture</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Manuscript footer decoration */}
      <div className="mt-10 pt-6 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400">
        <span className="font-mono text-[11px]">Texte intégral • 129 mots</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
          <span className="font-serif italic">Ambiance : Givre, Réveil cyclopéen, Obsession d'Elenya</span>
        </div>
      </div>
    </div>
  );
};
