import React from 'react';

interface AudioWaveVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
}

export const AudioWaveVisualizer: React.FC<AudioWaveVisualizerProps> = ({
  isPlaying,
  barCount = 24,
}) => {
  return (
    <div className="flex items-center justify-center gap-[3px] h-8 px-3 py-1 bg-neutral-900/60 rounded-full border border-neutral-800/80">
      {Array.from({ length: barCount }).map((_, i) => {
        // Deterministic heights pattern
        const baseHeight = 20 + Math.sin(i * 0.4) * 50;
        const animationDelay = `${(i * 0.08) % 1.2}s`;
        const animationDuration = `${0.6 + (i % 5) * 0.15}s`;

        return (
          <span
            key={i}
            className={`w-[2px] rounded-full transition-all duration-300 ${
              isPlaying
                ? 'bg-gradient-to-t from-amber-600 via-amber-400 to-amber-200 animate-pulse'
                : 'bg-neutral-700 h-[4px]'
            }`}
            style={{
              height: isPlaying ? `${Math.max(15, baseHeight)}%` : '4px',
              animationDelay,
              animationDuration,
            }}
          />
        );
      })}
    </div>
  );
};
