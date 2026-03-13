import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NetflixPlayer from "@/components/NetflixPlayer";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const TvAoVivo = () => {
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [playerTitle, setPlayerTitle] = useState("");

  const { data: channels, isLoading } = useQuery({
    queryKey: ["tv-ao-vivo"],
    queryFn: async () => {
      let allData: any[] = [];
      let from = 0;
      const limit = 1000;
      let hasMore = true;
      while (hasMore) {
        const { data, error } = await supabase.from("tv_ao_vivo").select("*").range(from, from + limit - 1);
        if (error || !data || data.length === 0) { hasMore = false; break; }
        allData = [...allData, ...data];
        from += limit;
        hasMore = data.length === limit;
      }
      return allData;
    }
  });

  const grouped = useMemo(() => {
    if (!channels) return {};
    const groups: Record<string, any[]> = {};
    channels.forEach((ch: any) => {
      const grupo = ch.grupo || "Outros";
      if (!groups[grupo]) groups[grupo] = [];
      groups[grupo].push(ch);
    });
    return groups;
  }, [channels]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 px-4 md:px-8 lg:px-12 pb-20">
        <h1 className="text-3xl md:text-4xl font-black mb-8 text-foreground">TV ao Vivo</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-20 text-muted-foreground">
            Sintonizando canais...
          </div>
        ) : (
          Object.entries(grouped).map(([grupo, chs]) => (
            <div key={grupo} className="mb-10">
              <h2 className="text-xl font-bold text-foreground mb-4 border-b border-border pb-2">{grupo}</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {chs.map((ch: any) => (
                  <button
                    key={ch.id}
                    onClick={() => { setPlayerUrl(ch.url); setPlayerTitle(ch.nome); }}
                    className="flex flex-col items-center gap-2 p-3 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-card/80 transition-all group active:scale-95"
                  >
                    {ch.logo ? (
                      <img 
                        src={ch.logo} 
                        alt={ch.nome} 
                        className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-lg bg-muted p-1 group-hover:scale-110 transition-transform" 
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:scale-110 transition-transform">
                        TV
                      </div>
                    )}
                    <span className="text-[10px] sm:text-xs font-semibold text-foreground text-center leading-tight line-clamp-2">
                      {ch.nome}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
      <Footer />

      {playerUrl && (
        <NetflixPlayer
          url={playerUrl}
          title={playerTitle}
          historyItem={{ id: `tv-live`, title: playerTitle, image: "", year: 2025, rating: "L", duration: "AO VIVO", genre: ["TV"], description: "TV ao Vivo", type: "movie" }}
          onClose={() => setPlayerUrl(null)}
        />
      )}
    </div>
  );
};

export default TvAoVivo;
