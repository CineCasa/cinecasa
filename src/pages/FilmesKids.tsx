import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import ContentRow from "@/components/ContentRow";
import Footer from "@/components/Footer";
import { useSupabaseContent } from "@/hooks/useSupabaseContent";

const FilmesKids = () => {
  const { data: categories, isLoading } = useSupabaseContent();

  const kidsMovies = categories?.filter(cat => cat.id === "kids-movies") || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-20">
        <HeroBanner filterCategory="Filmes Infantis" />
        <div className="relative z-10 pt-16 -mt-10">
          {isLoading ? (
            <div className="flex items-center justify-center p-20 text-muted-foreground">
              Carregando filmes para a criançada...
            </div>
          ) : (
            kidsMovies.map((cat) => (
              <ContentRow key={cat.id} category={cat} />
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FilmesKids;
