import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, Plus, ThumbsUp, ChevronLeft } from "lucide-react";
import { fetchTmdbDetails, fetchTmdbSeason, getTmdbTrailerUrl, tmdbImageUrl } from "@/services/tmdb";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NetflixPlayer from "@/components/NetflixPlayer";

const Details = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [playerUrl, setPlayerUrl] = useState<string>("");
  const [playerTitle, setPlayerTitle] = useState("");
  const [seasonData, setSeasonData] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [supabaseItem, setSupabaseItem] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadDetails = async () => {
      setLoading(true);
      if (!id || !type) { setLoading(false); return; }

      const tmdbType = type === "cinema" ? "movie" : "tv";
      const res = await fetchTmdbDetails(id, tmdbType);
      if (res) {
        setData(res);
        setTrailerUrl(getTmdbTrailerUrl(res.videos));
        if (tmdbType === "tv" && res.seasons?.length > 0) {
          const firstReal = res.seasons.find((s: any) => s.season_number > 0) || res.seasons[0];
          setSelectedSeason(firstReal.season_number);
        }
      }

      // Fetch Supabase data for URL/archive info
      if (type === "series") {
        const { data: seriesData } = await supabase.from("series").select("*").eq("tmdb_id", id).maybeSingle();
        if (seriesData) setSupabaseItem(seriesData);
      } else {
        const { data: cinemaData } = await supabase.from("cinema").select("*").eq("tmdb_id", id).maybeSingle();
        if (cinemaData) setSupabaseItem(cinemaData);
      }

      setLoading(false);
    };
    loadDetails();
  }, [id, type]);

  useEffect(() => {
    if (type === "series" && data && selectedSeason !== null) {
      fetchTmdbSeason(id!, selectedSeason).then(setSeasonData);
    }
  }, [selectedSeason, type, data, id]);

  const handlePlayMovie = () => {
    const url = supabaseItem?.url || supabaseItem?.trailer || trailerUrl || "";
    setPlayerUrl(url);
    setPlayerTitle(data?.title || data?.name || "");
    setIsPlayerOpen(true);
  };

  const handlePlayEpisode = (episode: any) => {
    let url = "";
    if (supabaseItem?.identificador_archive) {
      const archive = supabaseItem.identificador_archive;
      url = archive.startsWith("http") ? archive : `https://archive.org/embed/${archive}`;
    } else if (supabaseItem?.url) {
      url = supabaseItem.url;
    } else {
      url = trailerUrl || "";
    }
    setPlayerUrl(url);
    setPlayerTitle(`${data?.name || data?.title} - ${episode.name}`);
    setIsPlayerOpen(true);

    // Save to history with progress
    try {
      const hist = JSON.parse(localStorage.getItem("paixaohist") || "[]");
      const entry = {
        id: `series-${id}`,
        tmdbId: id,
        title: data?.name || data?.title,
        image: tmdbImageUrl(data?.poster_path, "w500"),
        backdrop: tmdbImageUrl(data?.backdrop_path, "original"),
        year: parseInt((data?.first_air_date || "").split("-")[0] || "0"),
        rating: data?.vote_average?.toFixed(1) || "N/A",
        duration: `T${selectedSeason} E${episode.episode_number}`,
        genre: data?.genres?.map((g: any) => g.name) || [],
        description: data?.overview || "",
        type: "series",
        timestamp: Date.now(),
        progress: 5
      };
      const existing = hist.findIndex((h: any) => h.id === entry.id);
      if (existing >= 0) hist[existing] = { ...hist[existing], ...entry };
      else hist.unshift(entry);
      localStorage.setItem("paixaohist", JSON.stringify(hist.slice(0, 50)));
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center animate-pulse pt-20">
          <span className="text-foreground text-xl">Carregando detalhes...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-20 space-y-4">
          <span className="text-foreground text-xl">Conteúdo não encontrado.</span>
          <button onClick={() => navigate(-1)} className="text-primary hover:underline">Voltar</button>
        </div>
      </div>
    );
  }

  const duration = type === "cinema"
    ? `${Math.floor((data.runtime || 0) / 60)}h ${(data.runtime || 0) % 60}min`
    : `${data.number_of_seasons} Temporadas`;
  const releaseYear = (data.release_date || data.first_air_date || "").split("-")[0];
  const director = data.credits?.crew?.find((c: any) => c.job === "Director")?.name;
  const cast = data.credits?.cast?.slice(0, 5).map((c: any) => c.name).join(", ");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <Navbar />

      <section className="relative w-full min-h-[85vh] md:min-h-[100vh] flex flex-col justify-end pt-32 pb-20 md:pb-40">
        <div className="absolute inset-0 z-0">
          <img
            src={tmdbImageUrl(data.backdrop_path, "original")}
            alt={data.title || data.name}
            className="w-full h-full object-cover object-top opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent w-[80%] md:w-[60%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-12 flex flex-col gap-6 max-w-7xl">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit mb-4 group">
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Voltar</span>
          </button>

          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-foreground leading-tight drop-shadow-2xl max-w-4xl tracking-tight">
            {data.title || data.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-semibold text-foreground/90">
            <span className="text-primary font-bold text-lg">CINECASA</span>
            <span className="text-[#ffff5c] font-bold text-lg">{(data.vote_average || 0).toFixed(1)}</span>
            <span>{duration}</span>
            <span>{releaseYear}</span>
            <span className="px-2 py-0.5 border border-border rounded scale-90 opacity-80 uppercase text-xs">
              {data.adult ? "18+" : "Livre"}
            </span>
          </div>

          <p className="text-lg md:text-xl text-foreground/80 max-w-3xl leading-relaxed drop-shadow-md font-medium">
            {data.overview}
          </p>

          <div className="text-sm md:text-base text-muted-foreground space-y-1 max-w-3xl mt-2">
            {cast && <p><span className="text-muted-foreground/60">Estrelando</span> {cast}</p>}
            {director && <p><span className="text-muted-foreground/60">Direção</span> {director}</p>}
            <p><span className="text-muted-foreground/60">Gêneros</span> {data.genres?.map((g: any) => g.name).join(", ")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <button
              onClick={type === "cinema" ? handlePlayMovie : () => {
                if (seasonData?.episodes?.[0]) handlePlayEpisode(seasonData.episodes[0]);
              }}
              className="flex items-center gap-3 bg-white text-black px-8 py-4 md:py-5 rounded-md font-bold text-lg md:text-xl hover:bg-white/90 transition-transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <Play size={28} fill="currentColor" />
              {type === "cinema" ? "Assistir Agora" : "Assistir T1 E1"}
            </button>

            {trailerUrl && (
              <button
                onClick={() => { setPlayerUrl(trailerUrl); setPlayerTitle(`Trailer - ${data.title || data.name}`); setIsPlayerOpen(true); }}
                className="flex items-center gap-3 bg-muted text-foreground px-8 py-4 md:py-5 rounded-md font-bold text-lg md:text-xl hover:bg-muted/80 transition-transform border border-border hover:scale-105"
              >
                Trailer
              </button>
            )}

            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-4 md:p-5 rounded-full border transition-all hover:scale-105 ${
                isFavorite ? "bg-primary border-primary text-primary-foreground" : "border-border text-foreground hover:bg-muted"
              }`}
            >
              <Plus size={24} className={isFavorite ? "rotate-45" : ""} />
            </button>
          </div>
        </div>
      </section>

      {/* Episodes Section (Series) */}
      {type === "series" && data.seasons && (
        <section className="relative z-10 w-full px-4 md:px-12 py-12 bg-background mx-auto max-w-[1400px]">
          <div className="flex items-center gap-6 mb-8 border-b border-border pb-4 overflow-x-auto">
            {data.seasons
              .filter((s: any) => s.season_number > 0)
              .sort((a: any, b: any) => a.season_number - b.season_number)
              .map((season: any) => (
                <button
                  key={season.id}
                  onClick={() => setSelectedSeason(season.season_number)}
                  className={`text-xl md:text-2xl font-bold whitespace-nowrap transition-colors ${
                    selectedSeason === season.season_number ? "text-foreground scale-105" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {season.name}
                </button>
              ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {!seasonData ? (
              <div className="col-span-full py-20 text-center text-muted-foreground animate-pulse">Carregando episódios...</div>
            ) : (
              seasonData.episodes?.map((episode: any) => (
                <div
                  key={episode.id}
                  onClick={() => handlePlayEpisode(episode)}
                  className="group relative flex flex-col gap-3 p-4 rounded-xl bg-card border border-border hover:bg-muted transition-all cursor-pointer"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") handlePlayEpisode(episode); }}
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary">
                    <img
                      src={tmdbImageUrl(episode.still_path, "w500")}
                      alt={episode.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <Play size={40} fill="white" className="text-white" />
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-bold rounded">
                      {episode.runtime ? `${episode.runtime} min` : ""}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-base leading-tight group-hover:text-primary transition-colors">
                      {episode.episode_number}. {episode.name}
                    </h4>
                    <p className="text-muted-foreground text-sm mt-2 line-clamp-3 leading-relaxed">
                      {episode.overview || "Nenhuma sinopse disponível."}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <div className="mt-auto"><Footer /></div>

      {isPlayerOpen && (
        <NetflixPlayer
          url={playerUrl}
          title={playerTitle}
          historyItem={{
            id: id || "",
            tmdbId: id,
            title: data.title || data.name,
            image: tmdbImageUrl(data.poster_path, "w500"),
            backdrop: tmdbImageUrl(data.backdrop_path, "original"),
            year: parseInt(releaseYear || "2000"),
            rating: data.vote_average?.toString() || "0",
            duration: duration,
            genre: data.genres?.map((g: any) => g.name) || [],
            description: data.overview,
            type: type as any
          }}
          onClose={() => setIsPlayerOpen(false)}
        />
      )}
    </div>
  );
};

export default Details;
