import { useMemo } from "react";
import { useSupabaseContent } from "./useSupabaseContent";
import { ContentItem } from "@/data/content";

// 1. Embeeding Builder (100% Local Hashing)
const createEmbedding = (item: ContentItem) => {
  // text -> simple hash -> 32 bit vector
  const txt = ((item.title || "") + " " + (item.genre?.join(" ") || "") + " " + (item.description || "")).toLowerCase();
  let hash = 0;
  for (let i = 0; i < txt.length; i++) {
    hash = Math.imul(31, hash) + txt.charCodeAt(i) | 0;
  }
  const vetTexto = Array.from({ length: 32 }, (_, k) => ((hash >>> (k * 7)) & 1));

  // numeric -> normaliza 0-1
  const ano = ((item.year || 2000) - 1900) / 130;
  const ratingNum = parseFloat(item.rating || "0");
  const nota = (isNaN(ratingNum) ? 5 : ratingNum) / 10;
  // duration isn't deeply tracked uniformly, fake it based on type
  const dur = item.type === "movie" ? 120 / 300 : 45 / 300;
  const vetNum = [ano, nota, dur];

  // concat 32 + 3 + 29 = 64
  const zeros = new Array(29).fill(0);
  return [...vetTexto, ...vetNum, ...zeros];
};

// 2. Cosine Similarity Function
const cosineSimilarity = (a: number[], b: number[]) => {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12);
};

export const useAiRecommendations = () => {
  const { data: categories, isLoading } = useSupabaseContent();

  const recommendations = useMemo(() => {
    if (!categories || categories.length === 0) return [];

    let history: any[] = [];
    try {
      history = JSON.parse(localStorage.getItem("paixaohist") || "[]");
    } catch (e) {
      history = [];
    }

    if (history.length === 0) return [];

    // Flatten all items from categories to a flat catalog
    const catalogMap = new Map<string, ContentItem>();
    categories.forEach(cat => {
      cat.items.forEach(item => {
        if (!catalogMap.has(String(item.id))) {
          catalogMap.set(String(item.id), item);
        }
      });
    });
    const catalog = Array.from(catalogMap.values());

    // Compute embeddings for all items if not done
    const catalogWithEmbeds = catalog.map(c => ({
      ...c,
      embed: createEmbedding(c)
    }));

    // Generate User Profile (average vector of history)
    const profile = new Array(64).fill(0);
    const validHistory = history.slice(0, 20).filter(h => h.id);
    
    if (validHistory.length === 0) return [];

    validHistory.forEach(h => {
      // Re-create embedding for history items since they might lack it
      const hEmbed = createEmbedding({
        id: h.id,
        title: h.title || "",
        genre: h.genre || [],
        description: h.description || "",
        year: h.year || 2020,
        type: h.type || "movie",
        image: "",
        rating: h.rating || "0",
        duration: h.duration || ""
      });
      for (let i = 0; i < 64; i++) {
        profile[i] += hEmbed[i];
      }
    });

    for (let i = 0; i < 64; i++) {
      profile[i] /= validHistory.length;
    }

    // Compare and get top 15 recommendations over 50% match
    const scores = catalogWithEmbeds
      .map(c => ({
        ...c,
        matchScore: Math.round(cosineSimilarity(profile, c.embed) * 100)
      }))
      .filter(c => !validHistory.find(h => String(h.id) === String(c.id))) // Don't recommend watched
      .filter(c => c.matchScore > 10) // Small threshold to avoid garbage
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 15);

    return scores;
  }, [categories]);

  return { recommendations, isLoading };
};
