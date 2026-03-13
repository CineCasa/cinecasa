import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useContentCounts = () => {
  return useQuery({
    queryKey: ["content-counts"],
    queryFn: async () => {
      const [cinema, series, filmesKids, seriesKids, tvAoVivo] = await Promise.all([
        supabase.from("cinema").select("id", { count: "exact", head: true }),
        supabase.from("series").select("id", { count: "exact", head: true }),
        supabase.from("filmes_kids").select("id", { count: "exact", head: true }),
        supabase.from("series_kids").select("id", { count: "exact", head: true }),
        supabase.from("tv_ao_vivo").select("id", { count: "exact", head: true }),
      ]);

      return {
        filmes: (cinema.count || 0) + (filmesKids.count || 0),
        series: (series.count || 0) + (seriesKids.count || 0),
        tvAoVivo: tvAoVivo.count || 0,
        total: (cinema.count || 0) + (series.count || 0) + (filmesKids.count || 0) + (seriesKids.count || 0)
      };
    }
  });
};
