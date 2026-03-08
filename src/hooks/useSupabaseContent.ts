import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContentItem, Category } from "@/data/content";
import { tmdbImageUrl, fetchTmdbDetails } from "@/services/tmdb";

export const useSupabaseContent = () => {
  return useQuery({
    queryKey: ["supabase-content"],
    queryFn: async () => {
      // 1. Fetch Supabase Data Recursively to bypass the 1000 rows limit
      const fetchAllRecords = async (table: "cinema" | "filmes_kids" | "series" | "series_kids" | "tv_ao_vivo") => {
        let allData: any[] = [];
        let from = 0;
        const limit = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from(table)
            .select("*")
            .range(from, from + limit - 1);
          
          if (error) {
            console.error(`Error fetching from ${table}:`, error);
            break;
          }
          
          if (data && data.length > 0) {
            allData = [...allData, ...data];
            from += limit;
            hasMore = data.length === limit;
          } else {
            hasMore = false;
          }
        }
        return allData;
      };

      const [
        cinema,
        filmesKids,
        series,
        seriesKids,
        tvAoVivo
      ] = await Promise.all([
        fetchAllRecords("cinema"),
        fetchAllRecords("filmes_kids"),
        fetchAllRecords("series"),
        fetchAllRecords("series_kids"),
        fetchAllRecords("tv_ao_vivo")
      ]);

      const splitGenres = (genreStr: string | null) => {
        if (!genreStr) return [];
        return genreStr.split(",").map(g => g.trim()).filter(g => g.length > 0);
      };

      const mapCinema = (item: any): ContentItem => {
        const genres = splitGenres(item.category || item.genero);
        return {
          id: `cinema-${item.id}`,
          tmdbId: item.tmdb_id,
          title: item.titulo,
          image: item.poster ? tmdbImageUrl(item.poster, "w500") : "",
          backdrop: item.poster ? tmdbImageUrl(item.poster, "original") : "",
          year: parseInt(item.year || "0"),
          rating: item.rating || "N/A",
          duration: "",
          genre: genres.length > 0 ? genres : ["Filme"],
          description: item.description || "",
          type: (item.type as any) || "movie",
          trailer: item.trailer
        };
      };

      const mapFilmesKids = (item: any): ContentItem => {
        const genres = splitGenres(item.genero || item.category);
        return {
          id: `kids-movie-${item.id}`,
          title: item.titulo,
          image: item.poster ? tmdbImageUrl(item.poster, "w500") : "",
          backdrop: item.poster ? tmdbImageUrl(item.poster, "original") : "",
          year: parseInt(item.year || "0"),
          rating: item.rating || "L",
          duration: "",
          genre: genres.length > 0 ? genres : ["Infantil"],
          description: item.description || "",
          type: "movie"
        };
      };

      const mapSeries = (item: any): ContentItem => {
        const genres = splitGenres(item.genero || item.category);
        return {
          id: `series-${item.id}`,
          tmdbId: item.tmdb_id,
          title: item.titulo,
          image: item.poster ? tmdbImageUrl(item.poster, "w500") : "",
          backdrop: item.poster ? tmdbImageUrl(item.poster, "original") : "",
          year: parseInt(item.year || "0"),
          rating: item.rating || "N/A",
          duration: "",
          genre: genres.length > 0 ? genres : ["Série"],
          description: item.description || "",
          type: "series",
          trailer: item.trailer
        };
      };

      const mapSeriesKids = (item: any): ContentItem => {
        const genres = splitGenres(item.genero || item.category);
        return {
          id: `kids-series-${item.id}`,
          title: item.titulo,
          image: item.poster ? tmdbImageUrl(item.poster, "w500") : "",
          backdrop: item.poster ? tmdbImageUrl(item.poster, "original") : "",
          year: parseInt(item.year || "0"),
          rating: item.rating || "L",
          duration: "",
          genre: genres.length > 0 ? genres : ["Infantil"],
          description: item.description || "",
          type: "series"
        };
      };

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

      const categories: Category[] = [];

      // Helper to group items by multiple categories
      const groupItemsCinema = (items: any[]) => {
        const grouped: Record<string, ContentItem[]> = {};
        
        CINEMA_MASTER_CATEGORIES.forEach(catName => {
          grouped[catName] = [];
        });

        items.forEach(item => {
          const itemYear = item.year?.toString() || "0";
          const rawCats = (item.category || item.genero || "");
          const itemCats = rawCats.split(",").map((s: string) => s.trim());
          
          let allocated = false;

          // 1. Check for launches first (Priority)
          if (itemYear === "2026" && grouped["Lançamento 2026"]) {
             grouped["Lançamento 2026"].push(mapCinema(item)); allocated = true;
          } else if (itemYear === "2025" && grouped["Lançamento 2025"]) {
             grouped["Lançamento 2025"].push(mapCinema(item)); allocated = true;
          }

          if (!allocated) {
             for (const catName of CINEMA_MASTER_CATEGORIES) {
                if (itemCats.includes(catName)) {
                   grouped[catName].push(mapCinema(item));
                   allocated = true;
                   break;
                }
             }
          }

          // 3. Fallback for items that didn't match
          if (!allocated) {
             if (grouped["Ação"]) {
               grouped["Ação"].push(mapCinema(item));
             }
          }
        });

        return CINEMA_MASTER_CATEGORIES
          .map(title => ({
            id: `cinema-${title.toLowerCase().replace(/\s+/g, "-")}`,
            title,
            items: grouped[title]
          }))
          .filter(cat => cat.items.length > 0);
      };

      if (cinema) {
        categories.push(...groupItemsCinema(cinema));
      }

      // Fetch TMDB data for SERIES safely in batches. Covers are wrong/blank without this!
      let seriesWithData: ContentItem[] = [];
      if (series && series.length > 0) {
        const chunkSize = 40; // Max parallel requests per batch (safe for TMDB 50 req/s limit)
        for (let i = 0; i < series.length; i += chunkSize) {
          const chunk = series.slice(i, i + chunkSize);
          const chunkResults = await Promise.all(
            chunk.map(async (s: any) => {
              if (!s.tmdb_id) return mapSeries(s);
              const data = await fetchTmdbDetails(s.tmdb_id, "tv");
              if (!data) return mapSeries(s);
              
              return {
                ...mapSeries(s),
                image: data.poster_path ? tmdbImageUrl(data.poster_path, "w500") : tmdbImageUrl(s.poster, "w500"),
                backdrop: data.backdrop_path ? tmdbImageUrl(data.backdrop_path, "original") : tmdbImageUrl(s.poster, "original"),
                year: parseInt(data.first_air_date?.split("-")[0] || "0"),
                rating: data.vote_average?.toFixed(1) || "N/A",
                genre: data.genres?.map((g: any) => g.name) || []
              };
            })
          );
          seriesWithData.push(...chunkResults);
          // Small delay for rate limits when loading 5000+ series
          if (series.length > 200) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      }

      if (seriesWithData.length > 0) {
        const groupedSeries: Record<string, ContentItem[]> = {};

        seriesWithData.forEach(s => {
          // Exclude "Sci", "Science Fiction", "Séries"
          const validGenres = s.genre.filter((g: string) => {
            const lower = g.toLowerCase();
            return !lower.includes("sci") && !lower.includes("série") && !lower.includes("series");
          });
          
          let primaryGenre = validGenres.length > 0 ? validGenres[0] : "Drama"; // Safe default TMDB genre

          if (!groupedSeries[primaryGenre]) {
            groupedSeries[primaryGenre] = [];
          }
          groupedSeries[primaryGenre].push(s);
        });

        Object.keys(groupedSeries).sort().forEach(genre => {
          const sortedItems = groupedSeries[genre].sort((a, b) => a.title.localeCompare(b.title));
          categories.push({
            id: `series-${genre.toLowerCase().replace(/\s+/g, "-")}`,
            title: genre,
            items: sortedItems
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
