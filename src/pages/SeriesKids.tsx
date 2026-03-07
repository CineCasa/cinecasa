import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import ContentRow from "@/components/ContentRow";
import Footer from "@/components/Footer";
import { useSupabaseContent } from "@/hooks/useSupabaseContent";

const SeriesKids = () => {
  const { data: categories, isLoading } = useSupabaseContent();

  const kidsSeries = categories?.filter(cat => cat.id === "kids-series") || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-20">
        <HeroBanner filterCategory="Séries Infant" />
        <div className="relative z-10 pt-16 -mt-10">
          {isLoading ? (
            <div className="flex items-center justify-center p-20 text-muted-foreground">
              Carregando diversão para os pequenos...
            </div>
          ) : (
            kidsSeries.map((cat) => (
              <ContentRow key={cat.id} category={cat} />
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SeriesKids;
