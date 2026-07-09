import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';
import { motion } from 'motion/react';

// Web Audio Synth engine helpers for the silent demo preview
const playSynthNote = (ctx: AudioContext, dest: AudioNode, freq: number, startTime: number, noteDuration: number, type: 'triangle' | 'sine' = 'triangle') => {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    // Smooth volume envelope to prevent click/pop sounds
    gain.gain.setValueAtTime(0, startTime);
    if (type === 'sine') {
      // Soft ambient chord pads
      gain.gain.linearRampToValueAtTime(0.06, startTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration - 0.05);
    } else {
      // Sweeter triangle lead melody
      gain.gain.linearRampToValueAtTime(0.08, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration - 0.05);
    }
    
    osc.connect(gain);
    gain.connect(dest);
    
    osc.start(startTime);
    osc.stop(startTime + noteDuration);
  } catch (err) {
    console.error('Error synthesizing note:', err);
  }
};

const playBeatSynth = (ctx: AudioContext, dest: AudioNode, beat: number, time: number) => {
  // Beautiful lofi chill chords (every 4 beats)
  if (beat === 0) {
    [130.81, 164.81, 196.00, 246.94].forEach(f => playSynthNote(ctx, dest, f, time, 2.2, 'sine')); // Cmaj7
  } else if (beat === 4) {
    [110.00, 130.81, 164.81, 196.00].forEach(f => playSynthNote(ctx, dest, f, time, 2.2, 'sine')); // Am7
  } else if (beat === 8) {
    [87.31, 110.00, 130.81, 164.81].forEach(f => playSynthNote(ctx, dest, f, time, 2.2, 'sine')); // Fmaj7
  } else if (beat === 12) {
    [98.00, 123.47, 146.83, 174.61].forEach(f => playSynthNote(ctx, dest, f, time, 2.2, 'sine')); // G7
  }

  // Pentatonic scale lofi melody (every 2 beats)
  const melodyNotes: { [key: number]: number } = {
    0: 659.25,  // E5
    2: 783.99,  // G5
    4: 880.00,  // A5
    6: 1046.50, // C6
    8: 1174.66, // D6
    10: 1046.50,// C6
    12: 987.77, // B5
    14: 783.99  // G5
  };

  if (melodyNotes[beat] !== undefined) {
    playSynthNote(ctx, dest, melodyNotes[beat], time, 0.8, 'triangle');
  }
};

interface AudioPlayerProps {
  audioUrl: string | null;
  title: string;
  artist: string;
  coverUrl: string | null;
  isDemo?: boolean;
}

export default function AudioPlayer({ audioUrl, title, artist, coverUrl, isDemo = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Web Audio Synth refs for demo playback
  const synthCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const currentBeatRef = useRef<number>(0);
  const scheduleIntervalRef = useRef<number | null>(null);

  const startSynth = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!synthCtxRef.current) {
        const ctx = new AudioContextClass();
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
        masterGain.connect(ctx.destination);
        
        synthCtxRef.current = ctx;
        masterGainRef.current = masterGain;
      }

      const ctx = synthCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      nextNoteTimeRef.current = ctx.currentTime;
      currentBeatRef.current = Math.floor(currentTime / 0.6) % 16;

      if (scheduleIntervalRef.current) {
        window.clearInterval(scheduleIntervalRef.current);
      }

      const lookAhead = 0.1;
      scheduleIntervalRef.current = window.setInterval(() => {
        if (!synthCtxRef.current || !masterGainRef.current) return;
        const c = synthCtxRef.current;
        
        while (nextNoteTimeRef.current < c.currentTime + lookAhead) {
          const scheduleTime = nextNoteTimeRef.current;
          const beat = currentBeatRef.current;
          
          playBeatSynth(c, masterGainRef.current, beat, scheduleTime);
          
          nextNoteTimeRef.current += 0.6;
          currentBeatRef.current = (beat + 1) % 16;
        }
      }, 50);
    } catch (err) {
      console.error('Error starting synthesizer:', err);
    }
  };

  const stopSynth = () => {
    if (scheduleIntervalRef.current) {
      window.clearInterval(scheduleIntervalRef.current);
      scheduleIntervalRef.current = null;
    }
    if (synthCtxRef.current && synthCtxRef.current.state === 'running') {
      synthCtxRef.current.suspend();
    }
  };

  // Reset player when source or demo status changes
  useEffect(() => {
    stopSynth();
    setIsPlaying(false);
    setCurrentTime(0);
    if (isDemo) {
      setDuration(120); // standard 2 minutes duration for demo synth
    } else {
      setDuration(0);
    }
  }, [audioUrl, isDemo]);

  // Handle ticking progress for synthesized audio
  useEffect(() => {
    let ticker: number | null = null;
    if (isPlaying && isDemo) {
      ticker = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 120) {
            setIsPlaying(false);
            stopSynth();
            return 0;
          }
          return Math.min(prev + 0.2, 120);
        });
      }, 200);
    }
    return () => {
      if (ticker) window.clearInterval(ticker);
    };
  }, [isPlaying, isDemo]);

  // Sync volume state with synthesizer master gain
  useEffect(() => {
    if (masterGainRef.current && synthCtxRef.current) {
      const currentVol = isMuted ? 0 : volume;
      masterGainRef.current.gain.setValueAtTime(currentVol, synthCtxRef.current.currentTime);
    }
  }, [volume, isMuted]);

  // Clean up all timers & audio contexts when component unmounts
  useEffect(() => {
    return () => {
      if (scheduleIntervalRef.current) {
        window.clearInterval(scheduleIntervalRef.current);
      }
      if (synthCtxRef.current) {
        synthCtxRef.current.close();
      }
    };
  }, []);

  const togglePlay = () => {
    if (isDemo) {
      if (isPlaying) {
        stopSynth();
        setIsPlaying(false);
      } else {
        startSynth();
        setIsPlaying(true);
      }
      return;
    }

    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Error playing audio:', err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDemo) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !isDemo) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (isDemo) {
      currentBeatRef.current = Math.floor(time / 0.6) % 16;
      if (synthCtxRef.current) {
        nextNoteTimeRef.current = synthCtxRef.current.currentTime;
      }
    } else if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      audioRef.current.muted = vol === 0;
    }
  };

  const toggleMute = () => {
    if (isDemo) {
      const nextMute = !isMuted;
      setIsMuted(nextMute);
      if (!nextMute && volume === 0) {
        setVolume(0.5);
      }
      return;
    }

    if (!audioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.muted = nextMute;
    if (!nextMute && volume === 0) {
      setVolume(0.5);
      audioRef.current.volume = 0.5;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!audioUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.37)] w-full flex flex-col gap-4 hover:border-blue-500/20 transition-all duration-300"
    >
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      {/* Track Info Row */}
      <div className="flex items-center gap-4">
        {/* Thumbnail Preview */}
        <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-white/10 flex items-center justify-center shadow-inner">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt="Mini-portada"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <Music className="w-6 h-6 text-blue-400" />
          )}
          {isPlaying && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-[2px]">
              <span className="w-1 bg-blue-400 rounded-full animate-pulse h-6" style={{ animationDelay: '0ms' }} />
              <span className="w-1 bg-blue-400 rounded-full animate-pulse h-4" style={{ animationDelay: '150ms' }} />
              <span className="w-1 bg-blue-400 rounded-full animate-pulse h-5" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>

        {/* Text Metadata */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-100 truncate">
            {title || 'Título Desconocido'}
          </h4>
          <p className="text-xs text-blue-400 truncate mt-0.5">
            {artist || 'Artista Desconocido'}
          </p>
          <span className="inline-block mt-1 font-mono text-[10px] uppercase tracking-wider bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">
            Vista Previa de Audio
          </span>
        </div>

        {/* Animated Soundwave Visualizer in Sidebar (Only if playing) */}
        <div className="hidden sm:flex items-end gap-1 h-6">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.4)] rounded-full"
              animate={{
                height: isPlaying ? [4, 24, 8, 20, 6, 16, 4][(i + Math.floor(Math.random() * 3)) % 7] : 4,
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: i * 0.1,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>

      {/* Control Deck (Scrubber & Buttons) */}
      <div className="flex flex-col gap-2">
        {/* Scrubber Range */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-gray-400 w-9 text-right select-none">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative group py-1 flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeekChange}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 outline-none hover:bg-white/20 transition-colors"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.1) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>
          <span className="font-mono text-xs text-gray-400 w-9 select-none">
            {formatTime(duration)}
          </span>
        </div>

        {/* Playback Controls & Volume Slider */}
        <div className="flex items-center justify-between mt-1">
          {/* Main Play Toggle */}
          <button
            onClick={togglePlay}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(59,130,246,0.35)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.5)] cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-[1px]" />
            )}
          </button>

          {/* Volume Control Deck */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-gray-400 hover:text-gray-200 p-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
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
              className="w-16 md:w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 outline-none"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
