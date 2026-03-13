import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContentItem, Category } from "@/data/content";
import { tmdbImageUrl, fetchTmdbDetails } from "@/services/tmdb";
import { useAuth } from "@/components/AuthProvider";

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

const splitCategories = (str: string | null): string[] => {
  if (!str) return [];
  return str.split(",").map(g => g.trim()).filter(g => g.length > 0);
};

const mapCinema = (item: any): ContentItem => ({
  id: `cinema-${item.id}`,
  tmdbId: item.tmdb_id,
  title: item.titulo,
  image: item.poster ? tmdbImageUrl(item.poster, "w500") : "",
  backdrop: item.poster ? tmdbImageUrl(item.poster, "original") : "",
  year: parseInt(item.year || "0"),
  rating: item.rating || "N/A",
  duration: "",
  genre: splitCategories(item.category) || ["Filme"],
  description: item.description || "",
  type: "movie",
  trailer: item.trailer,
  url: item.url
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
  genre: splitCategories(item.genero || item.category) || ["Série"],
  description: item.description || "",
  type: "series",
  trailer: item.trailer,
  identificadorArchive: item.identificador_archive
});

const mapFilmesKids = (item: any): ContentItem => ({
  id: `kids-movie-${item.id}`,
  tmdbId: item.tmdb_id,
  title: item.titulo,
  image: item.poster ? tmdbImageUrl(item.poster, "w500") : "",
  backdrop: item.poster ? tmdbImageUrl(item.poster, "original") : "",
  year: parseInt(item.year || "0"),
  rating: item.rating || "L",
  duration: "",
  genre: splitCategories(item.genero || item.category) || ["Infantil"],
  description: item.description || "",
  type: "movie",
  url: item.url,
  trailer: item.trailer
});

const mapSeriesKids = (item: any): ContentItem => ({
  id: `kids-series-${item.id}`,
  tmdbId: item.tmdb_id,
  title: item.titulo,
  image: item.poster ? tmdbImageUrl(item.poster, "w500") : "",
  backdrop: item.poster ? tmdbImageUrl(item.poster, "original") : "",
  year: parseInt(item.year || "0"),
  rating: item.rating || "L",
  duration: "",
  genre: splitCategories(item.genero || item.category) || ["Infantil"],
  description: item.description || "",
  type: "series",
  identificadorArchive: item.identificador_archive,
  trailer: item.trailer
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

const enrichWithTmdb = async (items: any[], mapFn: (item: any) => ContentItem, tmdbType: "movie" | "tv"): Promise<ContentItem[]> => {
  const results: ContentItem[] = [];
  for (let i = 0; i < items.length; i += 50) {
    const chunk = await Promise.all(items.slice(i, i + 50).map(async (item: any) => {
      const base = mapFn(item);
      if (!item.tmdb_id) return base;
      const data = await fetchTmdbDetails(item.tmdb_id, tmdbType);
      if (!data) return base;
      
      // Use Supabase category as primary, TMDB genres as fallback
      const supabaseGenres = splitCategories(item.category || item.genero);
      const tmdbGenres = data.genres?.map((g: any) => g.name) || [];
      
      return {
        ...base,
        image: data.poster_path ? tmdbImageUrl(data.poster_path, "w500") : base.image,
        backdrop: data.backdrop_path ? tmdbImageUrl(data.backdrop_path, "original") : base.backdrop,
        year: parseInt((tmdbType === "movie" ? data.release_date : data.first_air_date)?.split("-")[0] || item.year || "0"),
        rating: data.vote_average?.toFixed(1) || base.rating,
        genre: supabaseGenres.length > 0 ? supabaseGenres : tmdbGenres
      };
    }));
    results.push(...chunk);
  }
  return results;
};

// Group items by their categories dynamically - items with multiple categories appear in each
const groupByDynamicCategories = (items: ContentItem[], prefix: string): Category[] => {
  const categoryMap = new Map<string, ContentItem[]>();
  const categoryOrder: string[] = [];

  items.forEach(item => {
    const cats = item.genre.length > 0 ? item.genre : ["Outros"];
    cats.forEach(cat => {
      const catName = cat.trim();
      if (!catName) return;
      if (!categoryMap.has(catName)) {
        categoryMap.set(catName, []);
        categoryOrder.push(catName);
      }
      categoryMap.get(catName)!.push(item);
    });
  });

  return categoryOrder
    .map(title => ({
      id: `${prefix}-${title.toLowerCase().replace(/\s+/g, "-")}`,
      title,
      items: categoryMap.get(title)!.sort((a, b) => a.title.localeCompare(b.title))
    }))
    .filter(cat => cat.items.length > 0);
};

export const useSupabaseContent = () => {
  const { plan } = useAuth();

  return useQuery({
    queryKey: ["supabase-content", plan],
    queryFn: async () => {
      const [cinema, filmesKids, series, seriesKids, tvAoVivo] = await Promise.all([
        fetchAllRecords("cinema"),
        fetchAllRecords("filmes_kids"),
        fetchAllRecords("series"),
        fetchAllRecords("series_kids"),
        fetchAllRecords("tv_ao_vivo")
      ]);

      // Enrich with TMDB data
      const [cinemaData, seriesData, kidsMoviesData, kidsSeriesData] = await Promise.all([
        enrichWithTmdb(cinema || [], mapCinema, "movie"),
        enrichWithTmdb(series || [], mapSeries, "tv"),
        enrichWithTmdb(filmesKids || [], mapFilmesKids, "movie"),
        enrichWithTmdb(seriesKids || [], mapSeriesKids, "tv")
      ]);

      if (plan === "none") return [];

      // Apply plan restrictions
      let finalCinema = cinemaData;
      let finalSeries = seriesData;
      let finalKidsMovies = kidsMoviesData;
      let finalKidsSeries = kidsSeriesData;
      let finalTv = tvAoVivo || [];

      if (plan === "basic") {
        finalCinema = cinemaData.filter(c => c.year < 2025).slice(0, 50);
        finalSeries = seriesData.filter(s => s.year <= 2023).slice(0, 50);
        finalKidsMovies = kidsMoviesData.slice(0, 10);
        finalKidsSeries = kidsSeriesData.slice(0, 5);
        finalTv = [];
      }

      // Deduplicate by title
      const dedup = (items: ContentItem[]) => {
        const map = new Map<string, ContentItem>();
        items.forEach(i => {
          const key = i.title.toLowerCase().trim();
          if (!map.has(key)) map.set(key, i);
        });
        return Array.from(map.values());
      };

      const categories: Category[] = [];

      // Dynamic categories from Supabase data - preserving exact category names
      if (finalCinema.length > 0) {
        categories.push(...groupByDynamicCategories(dedup(finalCinema), "cinema"));
      }
      if (finalSeries.length > 0) {
        categories.push(...groupByDynamicCategories(dedup(finalSeries), "series"));
      }
      if (finalKidsMovies.length > 0) {
        categories.push(...groupByDynamicCategories(dedup(finalKidsMovies), "kids-movies"));
      }
      if (finalKidsSeries.length > 0) {
        categories.push(...groupByDynamicCategories(dedup(finalKidsSeries), "kids-series"));
      }
      if (finalTv.length > 0) {
        categories.push({ id: "tv-live", title: "TV ao Vivo", items: finalTv.map(mapTv) });
      }

      return categories;
    }
  });
};
