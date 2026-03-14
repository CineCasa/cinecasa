import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ContentCard from "@/components/ContentCard";
import Footer from "@/components/Footer";
import { useSupabaseContent } from "@/hooks/useSupabaseContent";
import { ContentItem } from "@/data/content";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";

const normalize = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { data: categories, isLoading } = useSupabaseContent();

  const allItems = useMemo(() => {
    if (!categories) return [];
    const seen = new Set();
    const items: ContentItem[] = [];
    categories.forEach(cat => {
      cat.items.forEach(item => {
        if (!seen.has(item.id)) { seen.add(item.id); items.push(item); }
      });
    });
    return items;
  }, [categories]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return [];
    const q = normalize(query);
    return allItems.filter(item =>
      normalize(item.title).includes(q) ||
      item.genre.some(g => normalize(g).includes(q)) ||
      normalize(item.description).includes(q)
    );
  }, [allItems, query]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0">
      <Navbar />
      <main className="pt-24 px-4 md:px-8 lg:px-12 pb-20">
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-muted-foreground mb-2">
            Resultados para: <span className="text-foreground">"{query}"</span>
          </h1>
          <p className="text-muted-foreground uppercase text-xs font-bold tracking-widest">
            {filteredItems.length} títulos encontrados
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 animate-pulse">
            <SearchIcon size={48} className="text-primary/20 mb-4" />
            <p className="text-muted-foreground font-medium">Buscando no catálogo...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-24 py-10">
            <AnimatePresence>
              {filteredItems.map((item, idx) => (
                <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.03 }} className="relative">
                  <ContentCard item={item} index={idx} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : query.trim() ? (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="bg-muted p-8 rounded-full mb-6"><SearchIcon size={64} className="text-muted-foreground/20" /></div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Nenhum título encontrado</h2>
            <p className="text-muted-foreground max-w-md">Tente buscar por outros termos. A busca funciona com ou sem acentuação.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <p className="text-muted-foreground">Digite algo para começar sua busca.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Search;
