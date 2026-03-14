import { useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import ContentRow from "@/components/ContentRow";
import Footer from "@/components/Footer";
import { useSupabaseContent } from "@/hooks/useSupabaseContent";
import ContinueWatchingRow from "@/components/ContinueWatchingRow";
import DynamicCategoryRow from "@/components/DynamicCategoryRow";
import TrendingGlobalRow from "@/components/TrendingGlobalRow";
import { useHomeSections } from "@/hooks/useHomeSections";
import { ContentItem } from "@/data/content";

// Shuffle deterministically per session (changes on page reload)
const sessionSeed = Date.now();
const shuffleArray = (array: any[]) => {
  const newArr = [...array];
  let seed = sessionSeed;
  for (let i = newArr.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const Index = () => {
  const { data: categories, isLoading } = useSupabaseContent();
  const { data: homeSections } = useHomeSections();

  // All items (excluding TV) for filtering
  const allItems = useMemo(() => {
    if (!categories) return [];
    return categories
      .filter(cat => cat.id !== "tv-live" && !cat.title.toLowerCase().includes("tv"))
      .flatMap(c => c.items);
  }, [categories]);

  // Deduplicated items
  const uniqueItems = useMemo(() => {
    const seen = new Set<string>();
    return allItems.filter(item => {
      const key = item.title.toLowerCase().replace(/temporada\s+\d+/g, "").trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allItems]);

  // Get user's most-watched genres for "Exclusivos para Você"
  const userGenres = useMemo(() => {
    try {
      const hist = JSON.parse(localStorage.getItem("paixaohist") || "[]");
      const genreCount: Record<string, number> = {};
      hist.forEach((h: any) => {
        (h.genre || []).forEach((g: string) => {
          genreCount[g.toLowerCase()] = (genreCount[g.toLowerCase()] || 0) + 1;
        });
      });
      return Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g]) => g);
    } catch { return []; }
  }, []);

  // Dynamic categories from Supabase (remaining ones not in fixed sections)
  const dynamicCategories = useMemo(() => {
    if (!categories) return [];
    const fixedIds = new Set(["tv-live"]);
    return categories.filter(cat => !fixedIds.has(cat.id));
  }, [categories]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isNavKey = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key);
      if (isNavKey && (active === document.body || !active || active.tagName === "DIV")) {
        const firstFocusable = document.querySelector('.nav-link-item, [tabindex="0"]') as HTMLElement;
        if (firstFocusable) { e.preventDefault(); firstFocusable.focus(); }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const pick5 = (items: ContentItem[]) => shuffleArray(items).slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="pb-20">
        <HeroBanner />
        <div className="relative z-10 pt-12 -mt-10 flex flex-col gap-4">
          {/* 1. Continuar Assistindo */}
          <ContinueWatchingRow />

          {/* 2. Lançamentos & Novidades */}
          <DynamicCategoryRow
            title="Lançamentos & Novidades"
            items={uniqueItems}
            filterFn={(item) => {
              const cats = item.genre.map(g => g.toLowerCase());
              return cats.some(c => c.includes("lançamento")) || Number(item.year) >= 2025;
            }}
            limit={5}
          />

          {/* 3. Exclusivos para Você */}
          {userGenres.length > 0 && (
            <DynamicCategoryRow
              title="Exclusivos para Você"
              items={uniqueItems}
              filterFn={(item) => item.genre.some(g => userGenres.includes(g.toLowerCase()))}
              limit={5}
            />
          )}

          {/* 4. Dinheiro Importa! */}
          <DynamicCategoryRow
            title="Dinheiro Importa!"
            items={uniqueItems}
            filterFn={(item) => {
              const cats = item.genre.map(g => g.toLowerCase()).join(" ");
              const title = item.title.toLowerCase();
              const desc = (item.description || "").toLowerCase();
              const keywords = ["finança", "dinheiro", "financ", "money", "investimento", "economia", "business", "wall street"];
              return keywords.some(k => cats.includes(k) || title.includes(k) || desc.includes(k));
            }}
            limit={5}
          />

          {/* 5. Negritude em Alta */}
          <DynamicCategoryRow
            title="Negritude em Alta"
            items={uniqueItems}
            filterFn={(item) => item.genre.some(g => g.toLowerCase().includes("negritude"))}
            limit={5}
          />

          {/* 6. Romances para se Inspirar */}
          <DynamicCategoryRow
            title="Romances para se Inspirar"
            items={uniqueItems}
            filterFn={(item) => item.genre.some(g => g.toLowerCase().includes("romance") || g.toLowerCase().includes("romântico"))}
            limit={5}
          />

          {/* 7. Prepare a Pipoca - Séries em Alta */}
          <TrendingGlobalRow title="Prepare a Pipoca" type="tv" />

          {/* 8. Como é bom ser criança */}
          <DynamicCategoryRow
            title="Como é bom ser criança"
            items={uniqueItems}
            filterFn={(item) => {
              const cats = item.genre.map(g => g.toLowerCase());
              return cats.some(c => c.includes("infantil") || c.includes("kids") || c.includes("animação") || c.includes("animation"));
            }}
            limit={5}
          />

          {/* 9. Vencedores de Oscar */}
          <TrendingGlobalRow title="Vencedores de Oscar" type="movie" />

          {/* 10. Travesseiro e Edredon */}
          <DynamicCategoryRow
            title="Travesseiro e Edredon"
            items={uniqueItems}
            filterFn={(item) => {
              const cats = item.genre.map(g => g.toLowerCase());
              return cats.some(c => c.includes("família") || c.includes("family") || c.includes("romance") || c.includes("comédia") || c.includes("comedy") || c.includes("religioso"));
            }}
            limit={5}
          />

          {/* 11. Seções dinâmicas do Supabase (home_sections) */}
          {homeSections && homeSections.map((section) => (
            <DynamicCategoryRow
              key={section.id}
              title={section.nome}
              items={uniqueItems}
              filterFn={(item) => {
                if (section.tipo === "categoria" && section.query) {
                  return item.genre.some(g => g.toLowerCase().includes(section.query!.toLowerCase()));
                }
                return false;
              }}
              limit={5}
            />
          ))}

          {/* All remaining Supabase categories */}
          {dynamicCategories.map((cat) => (
            <ContentRow key={cat.id} category={{ ...cat, items: cat.items.slice(0, 20) }} />
          ))}

          {isLoading && (
            <div className="flex justify-center p-10 text-muted-foreground">Carregando catálogo completo...</div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
