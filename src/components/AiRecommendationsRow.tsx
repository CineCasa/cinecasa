import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ContentCard from "./ContentCard";
import { ContentItem } from "@/data/content";

interface AiRecommendationsRowProps {
  items: (ContentItem & { matchScore?: number })[];
}

const AiRecommendationsRow = ({ items }: AiRecommendationsRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
  }, [items]);

  const scroll = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
    setTimeout(checkScroll, 400);
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative group/row mb-2 md:mb-8 z-10 hover:z-[60] transition-all duration-300">
      <h2 className="text-[clamp(1.4rem,2vw,1.8rem)] font-black px-4 md:px-8 lg:px-12 mb-6 tracking-tight drop-shadow-lg flex items-center gap-3">
        <span className="text-[var(--glow)]">💡 IA Local</span> 
        <span className="text-white/90">Baseado no que você curtiu</span>
      </h2>

      <div className="relative isolate">
        {canScrollLeft && (
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-0 bottom-0 w-12 md:w-16 z-[70] flex items-center justify-center bg-black/60 hover:bg-black/80 opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <ChevronLeft size={40} className="text-white" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide px-4 md:px-8 lg:px-12 py-24 -my-24 overflow-y-visible focus:outline-none"
          style={{ 
            scrollSnapType: "x mandatory",
            paddingInline: "6vw",
          }}
        >
          {items.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="relative flex-shrink-0 group">
                <ContentCard 
                  item={item} 
                  index={idx} 
                  isLast={idx === items.length - 1} 
                />
                <span className="absolute bottom-2 left-2 z-20 text-[11px] font-black text-black bg-[var(--glow)] px-2 py-0.5 rounded-[4px] shadow-[0_2px_10px_rgba(255,193,7,0.5)] pointer-events-none">
                  {item.matchScore}% match
                </span>
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-0 bottom-0 w-12 md:w-16 z-[70] flex items-center justify-center bg-black/60 hover:bg-black/80 opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <ChevronRight size={40} className="text-white" />
          </button>
        )}
      </div>
    </section>
  );
};

export default AiRecommendationsRow;
