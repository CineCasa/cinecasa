import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Play, Pause, Volume2, VolumeX, Maximize2, ChevronLeft } from "lucide-react";

interface NetflixPlayerProps {
  url: string;
  title: string;
  historyItem?: any;
  onClose: () => void;
}

const NetflixPlayer = ({ url, title, historyItem, onClose }: NetflixPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
  const isArchive = url.includes("archive.org");
  const isIframeSource = isYouTube || isArchive || url.includes("embed") || url.endsWith(".m3u8") || url.includes("player");

  useEffect(() => {
    if (historyItem) {
      try {
        const historyStr = localStorage.getItem("paixaohist");
        let history = historyStr ? JSON.parse(historyStr) : [];
        const existing = history.find((h: any) => h.id === historyItem.id);
        const startProgress = existing?.progress || 0;
        history = history.filter((h: any) => h.id !== historyItem.id);
        history.unshift({ ...historyItem, timestamp: Date.now(), progress: startProgress });
        localStorage.setItem("paixaohist", JSON.stringify(history.slice(0, 50)));
      } catch (e) { console.error("Failed to init history:", e); }
    }
  }, [historyItem]);

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
      const pct = (current / total) * 100;
      setProgress(pct);

      if (historyItem && total > 0 && Math.floor(current) % 5 === 0) {
        try {
          const historyStr = localStorage.getItem("paixaohist");
          let history = historyStr ? JSON.parse(historyStr) : [];
          const idx = history.findIndex((h: any) => h.id === historyItem.id);
          if (idx >= 0) { history[idx].progress = pct; history[idx].timestamp = Date.now(); }
          else history.unshift({ ...historyItem, timestamp: Date.now(), progress: pct });
          localStorage.setItem("paixaohist", JSON.stringify(history.slice(0, 50)));
        } catch (e) { console.error("Failed to update progress:", e); }
      }
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

  const handleContainerInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
  };

  // Build proper iframe URL
  const getIframeUrl = () => {
    if (isYouTube) {
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}autoplay=1&controls=1&mute=${isMuted ? 1 : 0}&modestbranding=1&rel=0&iv_load_policy=3&enablejsapi=1`;
    }
    if (isArchive) {
      return url.startsWith("http") ? url : `https://archive.org/embed/${url}`;
    }
    return url;
  };

  const playerContent = (
    <div
      className="fixed inset-0 z-[999999] bg-black flex items-center justify-center overflow-hidden pointer-events-auto"
      onMouseMove={(e) => { handleMouseMove(); e.stopPropagation(); }}
      onClick={handleContainerInteraction}
      onTouchStart={handleContainerInteraction}
    >
      {isIframeSource ? (
        <iframe
          src={getIframeUrl()}
          className="w-screen h-screen"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          title={title}
          style={{ border: "none" }}
        />
      ) : (
        <video
          ref={videoRef}
          src={url}
          className="w-full h-full object-contain"
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }}
          onClick={togglePlay}
        />
      )}

      {/* Top Bar */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent transition-all duration-300 ${
          showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
        }`}
        style={{ pointerEvents: showControls ? "auto" : "none" }}
        onClick={handleContainerInteraction}
      >
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
          <ChevronLeft size={32} />
        </button>
        <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-[0.15em] text-center flex-1 truncate px-4">{title}</h2>
        <div className="w-12" />
      </div>

      {/* Bottom Controls (only for native video) */}
      {!isIframeSource && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-8 flex items-center gap-4 transition-all duration-300 ${
            showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
          }`}
          style={{ pointerEvents: showControls ? "auto" : "none" }}
          onClick={handleContainerInteraction}
        >
          <button className="p-3 bg-white/20 rounded-full hover:bg-white/30 text-white transition-colors" onClick={togglePlay}>
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <div className="flex-1 flex flex-col gap-2">
            <div className="h-1.5 bg-white/20 rounded-full cursor-pointer relative" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              if (videoRef.current) { videoRef.current.currentTime = pct * duration; setProgress(pct * 100); }
            }}>
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between text-white/70 text-xs">
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              <div className="flex gap-3">
                <button onClick={() => setIsMuted(!isMuted)}>{isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(playerContent, document.body);
};

export default NetflixPlayer;
