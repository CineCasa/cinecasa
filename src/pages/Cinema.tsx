import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import ContentRow from "@/components/ContentRow";
import Footer from "@/components/Footer";
import { useSupabaseContent } from "@/hooks/useSupabaseContent";

const Cinema = () => {
  const { data: categories, isLoading } = useSupabaseContent();

  // Filtra apenas categorias que começam com "cinema-" (definido no hook)
  // As categorias agora seguem o padrão centralizado do hook
  const cinemaCategories = categories?.filter(cat => cat.id.startsWith("cinema-")) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-20">
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
