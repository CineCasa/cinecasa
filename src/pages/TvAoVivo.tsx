import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Radio, X } from "lucide-react";

const TvAoVivo = () => {
  const [selectedChannel, setSelectedChannel] = useState<any>(null);

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
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="pt-20 md:pt-24">
        {/* IPTV Split Layout */}
        <div className={`flex flex-col ${selectedChannel ? "lg:flex-row" : ""}`}>
          {/* Player Area */}
          {selectedChannel && (
            <div className="w-full lg:w-2/3 bg-black relative">
              <div className="aspect-video w-full relative">
                <iframe
                  src={selectedChannel.url}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; encrypted-media"
                  allowFullScreen
                  title={selectedChannel.nome}
                />
                <button
                  onClick={() => setSelectedChannel(null)}
                  className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 rounded-full text-foreground transition-colors z-10"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-foreground font-bold text-sm">AO VIVO</span>
                    <span className="text-muted-foreground text-sm">— {selectedChannel.nome}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Channel Grid */}
          <div className={`${selectedChannel ? "lg:w-1/3 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto" : "w-full"} px-4 md:px-8 lg:px-6 py-6`}>
            <div className="flex items-center gap-3 mb-6">
              <Radio className="text-primary" size={24} />
              <h1 className="text-2xl md:text-3xl font-black text-foreground">TV ao Vivo</h1>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-20 text-muted-foreground">Sintonizando canais...</div>
            ) : (
              Object.entries(grouped).map(([grupo, chs]) => (
                <div key={grupo} className="mb-6">
                  <h2 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider border-b border-border pb-2">{grupo}</h2>
                  <div className={`grid ${selectedChannel ? "grid-cols-3 lg:grid-cols-2 xl:grid-cols-3" : "grid-cols-3 sm:grid-cols-4 md:grid-cols-5"} gap-2`}>
                    {chs.map((ch: any) => {
                      const isActive = selectedChannel?.id === ch.id;
                      return (
                        <button
                          key={ch.id}
                          onClick={() => setSelectedChannel(ch)}
                          tabIndex={0}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all active:scale-95 ${
                            isActive
                              ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                              : "border-border bg-card hover:border-primary/30 hover:bg-card/80"
                          }`}
                        >
                          {ch.logo ? (
                            <img src={ch.logo} alt={ch.nome} className="w-10 h-10 object-contain rounded-lg bg-muted p-0.5" loading="lazy" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">TV</div>
                          )}
                          <span className="text-[9px] font-semibold text-foreground text-center leading-tight line-clamp-2">{ch.nome}</span>
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TvAoVivo;
