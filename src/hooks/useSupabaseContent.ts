import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContentItem, Category } from "@/data/content";
import { tmdbImageUrl, fetchTmdbDetails } from "@/services/tmdb";

export const useSupabaseContent = () => {
  return useQuery({
    queryKey: ["supabase-content"],
    queryFn: async () => {
      const [
        { data: cinema },
        { data: filmesKids },
        { data: series },
        { data: seriesKids },
        { data: tvAoVivo }
      ] = await Promise.all([
        supabase.from("cinema").select("*"),
        supabase.from("filmes_kids").select("*"),
        supabase.from("series").select("*"),
        supabase.from("series_kids").select("*"),
        supabase.from("tv_ao_vivo").select("*")
      ]);

      const mapCinema = (item: any): ContentItem => ({
        id: `cinema-${item.id}`,
        tmdbId: item.tmdb_id,
        title: item.titulo,
        image: item.poster ? tmdbImageUrl(item.poster, "w500") : "",
        backdrop: item.poster ? tmdbImageUrl(item.poster, "original") : "",
        year: parseInt(item.year || "0"),
        rating: item.rating || "N/A",
        duration: "",
        genre: item.category ? [item.category] : [],
        description: item.description || "",
        type: (item.type as any) || "movie",
        trailer: item.trailer
      });

      const mapFilmesKids = (item: any): ContentItem => ({
        id: `kids-movie-${item.id}`,
        title: item.titulo,
        image: item.poster ? tmdbImageUrl(item.poster, "w500") : "",
        backdrop: item.poster ? tmdbImageUrl(item.poster, "original") : "",
        year: parseInt(item.year || "0"),
        rating: item.rating || "L",
        duration: "",
        genre: item.genero ? [item.genero] : ["Infantil"],
        description: item.description || "",
        type: "movie"
      });

      const mapSeries = (item: any): ContentItem => ({
        id: `series-${item.id}`,
        tmdbId: item.tmdb_id,
        title: item.titulo,
        image: item.poster ? tmdbImageUrl(item.poster, "w500") : "",
        backdrop: item.poster ? tmdbImageUrl(item.poster, "original") : "",
        year: parseInt(item.year || "0"),
        rating: item.rating || "N/A",
        duration: "",
        genre: item.genero ? [item.genero] : ["Série"],
        description: item.description || "",
        type: "series",
        trailer: item.trailer
      });

      const mapSeriesKids = (item: any): ContentItem => ({
        id: `kids-series-${item.id}`,
        title: item.titulo,
        image: item.poster ? tmdbImageUrl(item.poster, "w500") : "",
        backdrop: item.poster ? tmdbImageUrl(item.poster, "original") : "",
        year: parseInt(item.year || "0"),
        rating: item.rating || "L",
        duration: "",
        genre: item.genero ? [item.genero] : ["Infantil"],
        description: item.description || "",
        type: "series"
      });

      const mapTv = (item: any): ContentItem => ({
        id: `tv-${item.id}`,
        title: item.nome,
        image: item.logo || "",
        year: new Date().getFullYear(),
        rating: "L",
        duration: "AO VIVO",
        genre: item.grupo ? [item.grupo] : ["TV"],
        description: "Canal de TV ao Vivo",
        type: "movie",
        trailer: item.url
      });

      const CINEMA_MASTER_CATEGORIES = [
        "Lançamento 2026", "Lançamento 2025", "Ação", "Aventura", "Anime", "Animação", 
        "Comédia", "Drama", "Dorama", "Clássicos", "Negritude", "Crime", "Policial", 
        "Família", "Musical", "Documentário", "Faroeste", "Ficção", "Nacional", 
        "Religioso", "Romance", "Terror", "Suspense", "Adulto"
      ];

      const SERIES_MASTER_CATEGORIES = [
        "Lançamento 2026", "Lançamento 2025", 
        "Ação e Aventura", "Animação", "Comédia", "Crime", 
        "Documentário", "Drama", "Família", "Kids", 
        "Mistério", "News", "Reality", "Ficção Científica e Fantasia", 
        "Soap", "Talk", "Guerra e Política", "Faroeste"
      ];

      const categories: Category[] = [];

      // Helper to group items by multiple categories
      const groupItems = (items: any[], type: "cinema" | "series") => {
        const masterList = type === "cinema" ? CINEMA_MASTER_CATEGORIES : SERIES_MASTER_CATEGORIES;
        const grouped: Record<string, ContentItem[]> = {};
        
        masterList.forEach(catName => {
          grouped[catName] = [];
        });

        items.forEach(item => {
          const itemYear = item.year?.toString() || "0";
          const rawCats = (item.category || item.genero || "");
          const itemCats = rawCats.split(",").map((s: string) => s.trim());
          
          let allocated = false;

          // 1. Check for launches first (priority)
          if (itemYear === "2026" && grouped["Lançamento 2026"]) {
            grouped["Lançamento 2026"].push(type === "cinema" ? mapCinema(item) : mapSeries(item));
            allocated = true;
          } else if (itemYear === "2025" && grouped["Lançamento 2025"]) {
            grouped["Lançamento 2025"].push(type === "cinema" ? mapCinema(item) : mapSeries(item));
            allocated = true;
          }

          // 2. Main categorization logic
          if (!allocated) {
            if (type === "cinema") {
              // Exclusive first-match for Cinema
              for (const catName of masterList) {
                if (itemCats.includes(catName)) {
                  grouped[catName].push(mapCinema(item));
                  allocated = true;
                  break;
                }
              }
            } else {
              // Multi-match for Series (TMDB style)
              masterList.forEach(catName => {
                if (itemCats.some((c: string) => c.toLowerCase() === catName.toLowerCase() || 
                    (catName === "Ação e Aventura" && (c === "Ação" || c === "Aventura")) ||
                    (catName === "Ficção Científica e Fantasia" && (c === "Ficção" || c === "Fantasia" || c === "Sci-Fi")))) {
                  grouped[catName].push(mapSeries(item));
                  allocated = true;
                }
              });
            }
          }

          // 3. Fallback for items that don't match any master category
          if (!allocated) {
             const fallbackCat = type === "cinema" ? "Aventura" : "Drama";
             if (grouped[fallbackCat]) {
               grouped[fallbackCat].push(type === "cinema" ? mapCinema(item) : mapSeries(item));
             }
          }
        });

        return masterList
          .map(title => ({
            id: `${type}-${title.toLowerCase().replace(/\s+/g, "-")}`,
            title,
            items: grouped[title]
          }))
          .filter(cat => cat.items.length > 0);
      };

      if (cinema) {
        categories.push(...groupItems(cinema, "cinema"));
      }

      // Fetch real TMDB data for series because the table is missing it
      const seriesWithData = series ? await Promise.all(
        series.slice(0, 100).map(async (s: any) => { // Limit to 100 for safety
          if (!s.tmdb_id) return mapSeries(s);
          const data = await fetchTmdbDetails(s.tmdb_id, "tv");
          if (!data) return mapSeries(s);
          
          return {
            ...mapSeries(s),
            image: tmdbImageUrl(data.poster_path, "w500"),
            backdrop: tmdbImageUrl(data.backdrop_path, "original"),
            year: parseInt(data.first_air_date?.split("-")[0] || "0"),
            rating: data.vote_average?.toFixed(1) || "N/A",
            genre: data.genres?.map((g: any) => g.name) || ["Drama"],
            description: data.overview || ""
          };
        })
      ) : [];

      if (seriesWithData.length > 0) {
        // Add a primary "Séries" category for HeroBanner
        categories.push({
          id: "series-all",
          title: "Séries",
          items: seriesWithData
        });

        // Group by TMDB Genres
        const groupedSeries: Record<string, ContentItem[]> = {};
        seriesWithData.forEach(s => {
          s.genre.forEach(g => {
            if (!groupedSeries[g]) groupedSeries[g] = [];
            groupedSeries[g].push(s);
          });
        });

        Object.entries(groupedSeries).forEach(([genre, items]) => {
          categories.push({
            id: `series-${genre.toLowerCase().replace(/\s+/g, "-")}`,
            title: genre,
            items
          });
        });
      }

      if (filmesKids && filmesKids.length > 0) {
        categories.push({
          id: "kids-movies",
          title: "Filmes Infantis",
          items: filmesKids.map(mapFilmesKids)
        });
      }

      if (seriesKids && seriesKids.length > 0) {
        categories.push({
          id: "kids-series",
          title: "Séries Infantis",
          items: seriesKids.map(mapSeriesKids)
        });
      }

      if (tvAoVivo && tvAoVivo.length > 0) {
        categories.push({
          id: "tv-live",
          title: "TV ao Vivo",
          items: tvAoVivo.map(mapTv)
        });
      }

      return categories;
    }
  });
};
