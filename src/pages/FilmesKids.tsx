import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import ContentRow from "@/components/ContentRow";
import Footer from "@/components/Footer";
import { useSupabaseContent } from "@/hooks/useSupabaseContent";

const FilmesKids = () => {
  const { data: categories, isLoading } = useSupabaseContent();
  const kidsMovies = categories?.filter(cat => cat.id.startsWith("kids-movies")) || [];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main>
        <HeroBanner filterCategory="Filmes Infantis" />
        <div className="relative z-10 pt-16 -mt-10">
          <h2 className="text-3xl font-black text-foreground mb-6 px-4 md:px-8 lg:px-12 tracking-tight uppercase">Filmes Infantis</h2>
          {isLoading ? (
            <div className="flex items-center justify-center p-20 text-muted-foreground">Carregando filmes para a criançada...</div>
          ) : kidsMovies.length === 0 ? (
            <div className="flex items-center justify-center p-20 text-muted-foreground">Nenhum filme infantil encontrado.</div>
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
