import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  FastForward,
  Rewind,
  Sparkles,
} from 'lucide-react';
import { AudioWaveVisualizer } from './AudioWaveVisualizer';

interface AudioPlayerBarProps {
  audioUrl: string | null;
  voiceName: string;
  durationEstimate?: number;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  audioUrl,
  voiceName,
  durationEstimate = 0,
  onTimeUpdate,
  onEnded,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.error('Audio play error:', e));
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || durationEstimate || 0;
    setCurrentTime(cur);
    setDuration(dur);
    if (onTimeUpdate) {
      onTimeUpdate(cur, dur);
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || durationEstimate || 0);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    if (onEnded) onEnded();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipSeconds = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const restartAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.error('Play error:', e));
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
        audioRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  const formatTime = (timeInSec: number) => {
    if (isNaN(timeInSec) || timeInSec < 0) return '00:00';
    const minutes = Math.floor(timeInSec / 60);
    const seconds = Math.floor(timeInSec % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadWav = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `narration-fantasy-${voiceName.toLowerCase()}-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const activeDuration = duration || durationEstimate || 1;
  const progressPercent = Math.min(100, (currentTime / activeDuration) * 100);

  return (
    <div className="bg-neutral-900/90 backdrop-blur-md border border-neutral-800/90 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/80 space-y-4">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
          className="hidden"
        />
      )}

      {/* Top row: Status info & Wave Visualizer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {isPlaying && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isPlaying ? 'bg-amber-500' : 'bg-neutral-600'
                }`}
              ></span>
            </span>
            <span className="text-xs font-serif tracking-wider uppercase text-neutral-300">
              Voix : <span className="text-amber-400 font-bold">{voiceName}</span>
            </span>
          </div>

          <span className="text-neutral-600">|</span>

          <span className="text-xs text-neutral-400 font-mono">
            {formatTime(currentTime)} / {formatTime(duration || durationEstimate)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <AudioWaveVisualizer isPlaying={isPlaying} barCount={20} />

          {audioUrl && (
            <button
              onClick={downloadWav}
              title="Télécharger l'audio (.wav)"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition flex items-center gap-1.5 border border-neutral-700/60"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Télécharger .wav</span>
            </button>
          )}
        </div>
      </div>

      {/* Middle row: Progress slider */}
      <div className="space-y-1.5">
        <div className="relative group flex items-center">
          <input
            type="range"
            min={0}
            max={activeDuration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            disabled={!audioUrl}
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none disabled:opacity-40"
          />
        </div>
      </div>

      {/* Bottom row: Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        {/* Playback rate presets */}
        <div className="flex items-center gap-1 bg-neutral-950/70 p-1 rounded-lg border border-neutral-800/80">
          {[0.8, 0.9, 1.0, 1.1, 1.25].map((rate) => (
            <button
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              className={`px-2 py-1 text-[11px] font-mono rounded transition ${
                playbackRate === rate
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Core buttons: rewind, play/pause, forward, restart */}
        <div className="flex items-center gap-2">
          <button
            onClick={restartAudio}
            disabled={!audioUrl}
            title="Recommencer depuis le début"
            className="p-2.5 rounded-full text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 transition disabled:opacity-40"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => skipSeconds(-5)}
            disabled={!audioUrl}
            title="Reculer de 5 secondes"
            className="p-2.5 rounded-full text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 transition disabled:opacity-40"
          >
            <Rewind className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            disabled={!audioUrl}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 text-neutral-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-neutral-950" />
            ) : (
              <Play className="w-5 h-5 fill-neutral-950 translate-x-0.5" />
            )}
          </button>

          <button
            onClick={() => skipSeconds(5)}
            disabled={!audioUrl}
            title="Avancer de 5 secondes"
            className="p-2.5 rounded-full text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 transition disabled:opacity-40"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-neutral-400 hover:text-neutral-200 transition"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 sm:w-20 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>
      </div>
    </div>
  );
};
