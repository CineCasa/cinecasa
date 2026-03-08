import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import ContentRow from "@/components/ContentRow";
import Footer from "@/components/Footer";
import { useSupabaseContent } from "@/hooks/useSupabaseContent";
import { useAiRecommendations } from "@/hooks/useAiRecommendations";
import AiRecommendationsRow from "@/components/AiRecommendationsRow";

const Index = () => {
  const { data: categories, isLoading } = useSupabaseContent();
  const { recommendations } = useAiRecommendations();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-20">
        <HeroBanner />
        <div className="relative z-10 pt-12 -mt-10">
          {recommendations && recommendations.length > 0 && (
            <AiRecommendationsRow items={recommendations} />
          )}
          {isLoading ? (
            <div className="flex items-center justify-center p-20 text-muted-foreground">
              Carregando conteúdos...
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-muted-foreground italic">
              Adicione novas seções aqui...
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
