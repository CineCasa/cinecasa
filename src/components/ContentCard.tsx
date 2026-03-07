import { useState, useRef, useEffect } from "react";
import { Play, Plus, ThumbsUp, Heart, Volume2, VolumeX, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ContentItem } from "@/data/content";
import { motion, AnimatePresence } from "framer-motion";
import { fetchTmdbDetails, getTmdbTrailerUrl } from "@/services/tmdb";
import NetflixPlayer from "./NetflixPlayer";

interface ContentCardProps {
  item: ContentItem;
  index: number;
  isLast?: boolean;
}

const ContentCard = ({ item, index, isLast }: ContentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(item.trailer || null);
  const [metadata, setMetadata] = useState<{ duration: string; rating: string } | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const trailerLoadTimeout = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const handleNavigateToDetails = () => {
    const typePath = item.id.includes("series") ? "series" : "cinema";
    // If the item doesn't have a tmdbId, we might pass its ID
    navigate(`/details/${typePath}/${item.tmdbId || item.id}`);
  };

  useEffect(() => {
    if (isHovered && item.tmdbId && !metadata) {
      const type = item.id.includes("series") ? "tv" : "movie";
      fetchTmdbDetails(item.tmdbId, type).then((data) => {
        if (data) {
          const duration = type === "movie" 
            ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}min`
            : `${data.numberOf_seasons} Temporadas`;
          setMetadata({
            duration,
            rating: data.vote_average?.toFixed(1) || item.rating
          });
          if (!trailerUrl) {
            setTrailerUrl(getTmdbTrailerUrl(data.videos));
          }
        }
      });
    }
  }, [isHovered, item.tmdbId]);

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => {
      setIsHovered(true);
      // Trailer delay of 1500ms as requested
      trailerLoadTimeout.current = setTimeout(() => setShowTrailer(true), 1500);
    }, 400);
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
      if (!isHovered) {
        setIsHovered(true);
      } else {
        setIsPlayerOpen(true);
      }
    }
    if (e.key === "Escape") {
      setIsHovered(false);
    }
  };

  const getTransformOrigin = () => {
    const el = containerRef.current;
    if (!el) return "center center";
    
    const rect = el.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    
    if (rect.left < 100) return "left center";
    if (rect.right > windowWidth - 100) return "right center";
    return "center center";
  };

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`relative flex-shrink-0 w-[220px] sm:w-[250px] md:w-[280px] lg:w-[320px] aspect-[2/3] transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black rounded-lg ${
        isHovered ? "z-[99999]" : "z-0"
      }`}
    >
      {/* BASE PORTRAIT IMAGE (Visible when NOT hovered) */}
      <div className={`w-full h-full rounded-lg overflow-hidden bg-secondary shadow-lg transition-opacity duration-300 ${isHovered ? "opacity-0" : "opacity-100"}`}>
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-4 flex flex-col justify-end">
           <h3 className="text-sm font-bold text-white truncate drop-shadow-md">{item.title}</h3>
           <div className="flex items-center gap-2 mt-1">
              <span className="text-primary text-xs font-black drop-shadow-sm">{item.rating}</span>
              <span className="text-white/60 text-[10px] uppercase font-bold">{item.year}</span>
           </div>
        </div>
      </div>

      {/* EXPANDED STATE (Floating Overlay) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ scale: 1, opacity: 0, y: 0 }}
            animate={{ 
              scale: 1.15, // Estilo Prime Video: Expansão sutil
              opacity: 1,
              y: -10, // Pequeno salto para frente
            }}
            exit={{ scale: 1, opacity: 0, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ 
              transformOrigin: getTransformOrigin(),
              zIndex: 100000 
            }}
            className="absolute top-0 left-0 w-full bg-[#1b1b1b] rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-white/10"
          >
            {/* TOP: MEDIA SECTION (VIDEO OR PHOTO) */}
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              {showTrailer && trailerUrl ? (
                <iframe
                  src={trailerUrl.includes("?") ? `${trailerUrl}&origin=${window.location.origin}` : `${trailerUrl}?origin=${window.location.origin}`}
                  className="w-full h-full object-cover scale-[1.05]"
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  title={item.title}
                  frameBorder="0"
                />
              ) : (
                <img
                  src={item.backdrop || item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-4 left-4 z-10">
                 <h3 className="text-white font-black text-sm drop-shadow-lg text-shadow-premium">{item.title}</h3>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#141414] to-transparent" />
            </div>

            {/* BOTTOM: METADATA SECTION (Outside and below the image) */}
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsPlayerOpen(true)}
                    className="p-2 rounded-full bg-white text-black hover:bg-white/80 transition-colors"
                  >
                    <Play size={16} fill="currentColor" />
                  </button>
                  <button className="p-2 rounded-full border border-white/40 text-white hover:bg-white/10 transition-colors">
                    <Plus size={16} />
                  </button>
                  <button 
                    onClick={handleNavigateToDetails}
                    className="p-2 rounded-full border border-white/40 text-white hover:bg-white/10 transition-colors"
                    title="Mais Informações"
                  >
                    <Info size={16} />
                  </button>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFavorite(!isFavorite);
                  }}
                  className={`p-2 rounded-full border border-white/40 transition-all ${
                    isFavorite ? "bg-red-600 border-red-600 text-white" : "text-white hover:bg-white/10"
                  }`}
                >
                  <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[#ffff5c] font-black text-xs whitespace-nowrap">
                  {metadata?.rating || item.rating} Relevante
                </span>
                <span className="text-white font-bold text-[10px] px-1.5 py-0.5 border border-white/40 rounded leading-none">
                  {item.rating}
                </span>
                <span className="text-white/60 text-xs">{item.year}</span>
                <span className="text-white text-xs font-bold ml-auto">
                  {metadata?.duration || "Carregando..."}
                </span>
              </div>

              <div className="flex gap-2 flex-wrap">
                {item.genre.slice(0, 3).map((g) => (
                  <span key={g} className="text-[10px] text-white/70 font-medium">
                    {g}
                  </span>
                ))}
              </div>
              <button 
                onClick={() => setIsPlayerOpen(true)}
                className="w-full py-2 mt-1 bg-white text-black font-black text-xs rounded hover:bg-white/80 transition-colors uppercase tracking-widest"
              >
                Assistir Agora
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Video Player */}
      {isPlayerOpen && (
        <NetflixPlayer 
          url={trailerUrl || ""} 
          title={item.title} 
          onClose={() => setIsPlayerOpen(false)} 
        />
      )}
    </div>
  );
};

export default ContentCard;
