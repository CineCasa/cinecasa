import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Settings, Subtitles, AudioLines, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NetflixPlayerProps {
  url: string;
  title: string;
  onClose: () => void;
}

const NetflixPlayer = ({ url, title, onClose }: NetflixPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
  };

  const formatTime = (time: number) => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      const time = (val / 100) * duration;
      videoRef.current.currentTime = time;
      setProgress(val);
    }
  };

  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");

  const handleContainerInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-[999999] bg-black flex items-center justify-center overflow-hidden pointer-events-auto"
      onMouseMove={(e) => {
        handleMouseMove();
        e.stopPropagation();
      }}
      onClick={handleContainerInteraction}
      onTouchStart={handleContainerInteraction}
    >
      {isYouTube ? (
        <iframe
          src={`${url}?autoplay=1&controls=0&mute=${isMuted ? 1 : 0}&modestbranding=1&rel=0&iv_load_policy=3`}
          className="w-screen h-screen pointer-events-none"
          allow="autoplay; fullscreen"
          title={title}
        />
      ) : (
        <video
          ref={videoRef}
          src={url}
          className="w-full h-full object-contain"
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlay}
        />
      )}

      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between pointer-events-auto"
            onClick={handleContainerInteraction}
          >
            {/* Top Bar */}
            <div className="p-8 flex items-center justify-between">
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                <RotateCcw size={32} />
              </button>
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-[0.2em]">{title}</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                <X size={32} />
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="p-8 pb-12 flex flex-col gap-6">
              {/* Progress Bar */}
              <div className="flex flex-col gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={seek}
                  className="w-full h-1 bg-white/20 appearance-none cursor-pointer accent-primary hover:h-2 transition-all"
                />
                <div className="flex justify-end text-sm text-white font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform">
                    {isPlaying ? <Pause size={48} fill="white" /> : <Play size={48} fill="white" />}
                  </button>
                  <button className="text-white hover:scale-110 transition-transform hidden md:block">
                    <RotateCcw size={32} className="transform -scale-x-100" />
                  </button>
                  <button className="text-white hover:scale-110 transition-transform hidden md:block">
                    <RotateCcw size={32} />
                  </button>
                  <div className="flex items-center gap-4 group">
                    <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:scale-110 transition-transform">
                      {isMuted ? <VolumeX size={32} /> : <Volume2 size={32} />}
                    </button>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={isMuted ? 0 : volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-0 group-hover:w-24 transition-all overflow-hidden accent-primary" 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-8">
                   <div className="flex items-center gap-2 group cursor-pointer hover:bg-white/10 px-3 py-2 rounded transition-colors">
                      <AudioLines size={24} className="text-white" />
                      <span className="text-white text-sm font-bold uppercase hidden md:inline">Áudio e Legendas</span>
                   </div>
                   <button className="text-white hover:scale-110 transition-transform">
                    <Info size={32} />
                  </button>
                  <button className="text-white hover:scale-110 transition-transform">
                    <Settings size={32} />
                  </button>
                  <button className="text-white hover:scale-110 transition-transform">
                    <Maximize2 size={32} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NetflixPlayer;
