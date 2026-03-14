import { useState, useRef, useEffect } from "react";
import { Play, Plus, ThumbsUp, Heart, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ContentItem } from "@/data/content";
import { motion, AnimatePresence } from "framer-motion";
import { fetchTmdbDetails, getTmdbTrailerUrl } from "@/services/tmdb";
import NetflixPlayer from "./NetflixPlayer";

interface ContentCardProps {
  item: ContentItem & { progress?: number, isComingSoon?: boolean };
  index: number;
  isLast?: boolean;
  showProgress?: boolean;
}

const ContentCard = ({ item, index, isLast = false, showProgress = false }: ContentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(item.trailer || null);
  const [metadata, setMetadata] = useState<{ duration: string; rating: string } | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const trailerLoadTimeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const isSeries = item.type === "series" || item.id.includes("series");
  const isMovie = !isSeries;

  const handlePlay = () => {
    if (item.isComingSoon) return;
    if (isSeries) {
      // Series → go to details page with episodes
      navigate(`/details/series/${item.tmdbId || item.id}`);
    } else {
      // Movie → open player directly
      setIsPlayerOpen(true);
      // Save to watch history
      saveToHistory();
    }
  };

  const handleNavigateToDetails = () => {
    if (item.isComingSoon) return;
    const typePath = isSeries ? "series" : "cinema";
    navigate(`/details/${typePath}/${item.tmdbId || item.id}`);
  };

  const saveToHistory = () => {
    try {
      const hist = JSON.parse(localStorage.getItem("paixaohist") || "[]");
      const existing = hist.findIndex((h: any) => h.id === item.id);
      const entry = { ...item, timestamp: Date.now(), progress: 1 };
      if (existing >= 0) {
        hist[existing] = { ...hist[existing], timestamp: Date.now() };
      } else {
        hist.unshift(entry);
      }
      localStorage.setItem("paixaohist", JSON.stringify(hist.slice(0, 50)));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("paixaofavs") || "[]");
      setIsFavorite(favs.some((f: any) => f.id === item.id));
    } catch (e) {
      console.error(e);
    }

    if (isHovered && item.tmdbId && !metadata) {
      const type = isSeries ? "tv" : "movie";
      fetchTmdbDetails(item.tmdbId, type).then((data) => {
        if (data) {
          const duration = type === "movie"
            ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}min`
            : `${data.number_of_seasons} Temporadas`;
          setMetadata({ duration, rating: data.vote_average?.toFixed(1) || item.rating });
          if (!trailerUrl) setTrailerUrl(getTmdbTrailerUrl(data.videos));
        }
      });
    }
  }, [isHovered, item.tmdbId, item.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const favs = JSON.parse(localStorage.getItem("paixaofavs") || "[]");
      const newFavs = isFavorite ? favs.filter((f: any) => f.id !== item.id) : [...favs, item];
      localStorage.setItem("paixaofavs", JSON.stringify(newFavs));
      setIsFavorite(!isFavorite);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => {
      setIsHovered(true);
      trailerLoadTimeout.current = setTimeout(() => setShowTrailer(true), 1000);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    if (trailerLoadTimeout.current) clearTimeout(trailerLoadTimeout.current);
    setIsHovered(false);
    setShowTrailer(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isHovered) setIsHovered(true);
      else handlePlay();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const row = containerRef.current?.closest('.row-scroll-container');
      const allCards = Array.from(row?.querySelectorAll('[tabindex="0"]') || []);
      const currentIndex = allCards.indexOf(containerRef.current!);
      const next = (allCards[currentIndex + 1] || allCards[0]) as HTMLElement;
      if (next) { next.focus(); next.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }); }
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const row = containerRef.current?.closest('.row-scroll-container');
      const allCards = Array.from(row?.querySelectorAll('[tabindex="0"]') || []);
      const currentIndex = allCards.indexOf(containerRef.current!);
      const prev = allCards[currentIndex - 1] as HTMLElement;
      if (prev) { prev.focus(); prev.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }); }
    }
    if (e.key === "Escape") setIsHovered(false);
  };

  const getTransformOrigin = () => {
    const el = containerRef.current;
    if (!el) return "left center";
    const rect = el.getBoundingClientRect();
    if (rect.right > window.innerWidth - 150) return "right center";
    return "left center";
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { rootMargin: "200px" }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`relative flex-shrink-0 
        w-[calc((100vw-32px-16px)/2)] 
        md:w-[calc((100vw-64px-48px)/3)] 
        lg:w-[calc((100vw-96px-96px)/5)] 
        aspect-[2/3] transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black rounded-lg ${
        isHovered ? "z-[99999]" : "z-0"
      }`}
    >
      {/* BASE IMAGE */}
      <div className={`w-full h-full rounded-lg overflow-hidden bg-secondary shadow-lg transition-opacity duration-300 ${isHovered ? "opacity-0" : "opacity-100"}`}>
        {isVisible ? (
          <img src={item.image} alt={item.title} className="w-full h-full object-cover animate-in fade-in duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-secondary animate-pulse" />
        )}
        {item.isComingSoon && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg z-30">Em Breve</div>
        )}
        {showProgress && item.progress && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50 overflow-hidden z-20">
            <div className="h-full bg-primary transition-all" style={{ width: `${item.progress}%` }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-4 flex flex-col justify-end">
          <h3 className="text-sm font-bold text-white truncate drop-shadow-md">{item.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-primary text-xs font-black drop-shadow-sm">{item.rating}</span>
            <span className="text-white/60 text-[10px] uppercase font-bold">{item.year}</span>
            {isSeries && <span className="text-primary/80 text-[9px] font-bold uppercase bg-primary/20 px-1.5 py-0.5 rounded">Série</span>}
          </div>
        </div>
      </div>

      {/* EXPANDED STATE */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: 1.25, opacity: 1, y: -10, width: "160%", height: "auto" }}
            exit={{ scale: 1, opacity: 0, y: 0, width: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{ transformOrigin: getTransformOrigin(), zIndex: 100000 }}
            className="absolute top-0 left-0 bg-card rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.9)] overflow-hidden ring-1 ring-white/20 w-[160%] h-auto"
          >
            <div className="relative w-full aspect-video overflow-hidden bg-black">
              {showTrailer && trailerUrl ? (
                <iframe
                  src={trailerUrl.includes("?")
                    ? `${trailerUrl}&autoplay=1&mute=1&controls=0&loop=1&enablejsapi=1`
                    : `${trailerUrl}?autoplay=1&mute=1&controls=0&loop=1&enablejsapi=1`}
                  className="absolute inset-0 w-full h-full object-cover scale-[1.05]"
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  allowFullScreen
                  title={item.title}
                  style={{ border: "none" }}
                  loading="lazy"
                />
              ) : (
                <>
                  <img src={item.backdrop || item.image} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute bottom-4 left-4 z-10">
                    <h3 className="text-white font-black text-sm drop-shadow-lg">{item.title}</h3>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />
                </>
              )}
            </div>

            <div className="p-4 flex flex-col gap-3 bg-card border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex gap-2 items-center">
                  <button
                    onClick={handlePlay}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-xs transition-all ${item.isComingSoon ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-white text-black hover:bg-white/80 active:scale-95"}`}
                  >
                    <Play size={14} fill="currentColor" />
                    {isSeries ? "Ver Episódios" : "Assistir Agora"}
                  </button>
                  <button onClick={toggleFavorite} className="p-2 rounded-full border border-border text-red-600 hover:bg-muted transition-colors active:scale-90">
                    <Heart size={18} fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" />
                  </button>
                  <button onClick={handleNavigateToDetails} className="p-2 rounded-full border border-border text-foreground hover:bg-muted transition-colors">
                    <Info size={18} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#ffff5c] font-black text-xs">{metadata?.rating || item.rating} Relevante</span>
                <span className="text-muted-foreground text-xs font-bold">{item.year}</span>
                {metadata?.duration && <span className="text-muted-foreground text-xs">{metadata.duration}</span>}
              </div>
              <p className="text-muted-foreground text-[10px] sm:text-xs line-clamp-2 leading-relaxed">{item.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isPlayerOpen && (
        <NetflixPlayer
          url={
            isSeries
              ? (item.identificadorArchive?.startsWith("http") ? item.identificadorArchive : `https://archive.org/embed/${item.identificadorArchive}`)
              : (item.url || trailerUrl || "")
          }
          title={item.title}
          historyItem={item}
          onClose={() => setIsPlayerOpen(false)}
        />
      )}
    </div>
  );
};

export default ContentCard;
