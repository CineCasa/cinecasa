import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import ContentRow from "@/components/ContentRow";
import Footer from "@/components/Footer";
import { useSupabaseContent } from "@/hooks/useSupabaseContent";
import { useMemo } from "react";

const CINEMA_CATEGORY_ORDER = [
  "Lançamento 2026", "Lançamento 2025", "Ação", "Aventura", "Anime", "Animação",
  "Comédia", "Drama", "Dorama", "Clássicos", "Negritude", "Crime", "Policial",
  "Família", "Musical", "Documentário", "Faroeste", "Ficção", "Nacional",
  "Religioso", "Romance", "Terror", "Suspense", "Adulto"
];

const Cinema = () => {
  const { data: categories, isLoading } = useSupabaseContent();

  const cinemaCategories = useMemo(() => {
    const all = categories?.filter(cat => cat.id.startsWith("cinema-")) || [];
    
    // Sort by fixed order
    const orderMap = new Map(CINEMA_CATEGORY_ORDER.map((name, idx) => [name.toLowerCase(), idx]));
    
    return [...all].sort((a, b) => {
      const aIdx = orderMap.get(a.title.toLowerCase()) ?? 999;
      const bIdx = orderMap.get(b.title.toLowerCase()) ?? 999;
      return aIdx - bIdx;
    });
  }, [categories]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main>
        <HeroBanner filterCategory="Cinema" />
        <div className="relative z-10 pt-16 -mt-10">
          {isLoading ? (
            <div className="flex items-center justify-center p-20 text-muted-foreground">
              Carregando produções de cinema...
            </div>
          ) : (
            cinemaCategories.map((cat) => (
              <ContentRow key={cat.id} category={cat} />
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cinema;
