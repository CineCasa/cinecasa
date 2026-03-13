import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HomeSection {
  id: string;
  nome: string;
  tipo: string;
  query: string | null;
  ordem: number;
  ativo: boolean;
}

export const useHomeSections = () => {
  return useQuery({
    queryKey: ["home-sections"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("home_sections")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });

      if (error) {
        console.error("Error fetching home sections:", error);
        return [];
      }
      return (data || []) as HomeSection[];
    }
  });
};
