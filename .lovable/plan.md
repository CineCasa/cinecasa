

# Plano: Reestruturação Completa — Navegação, Player, Categorias, Admin e UX

Este plano aborda todas as solicitações agrupadas por dependência.

---

## 1. Admin com Login Dedicado (sem ProtectedRoute)

**Problema:** `/admin` usa `ProtectedRoute` que redireciona para `/plans`. Deve ter seu próprio login e ir direto ao painel admin.

**Solução:**
- Remover `ProtectedRoute` do `/admin` em `App.tsx`
- Criar rota `/admin` que verifica auth internamente: se não logado, mostra formulário de login inline; se logado mas não admin, mostra "Acesso Negado"; se admin, mostra o painel
- Admin nunca passa pela página de planos nem pela home

**Arquivos:** `App.tsx`, `Admin.tsx`

---

## 2. Navbar Responsiva: Topo (Desktop/TV) + Rodapé (Mobile)

**Problema:** Navbar atual é sempre no topo com menu hambúrguer no mobile.

**Solução:** Reescrever `Navbar.tsx` com dois componentes:
- **Desktop/TV (≥768px):** Barra superior fixa acima do banner com itens: Início, Cinema, Séries, TV ao Vivo, Filmes Kids, Séries Kids, Favoritos, Busca, Perfil
- **Mobile (<768px):** Barra fixa no rodapé (estilo Netflix/Disney+) com ícones: Início, Cinema, Séries, Busca, Favoritos + Menu "Mais" para TV, Kids etc.
- Remover menu hambúrguer mobile

**Arquivo:** `src/components/Navbar.tsx`

---

## 3. Remover Scrollbar de Navegação (já feito, confirmar)

A scrollbar de conteúdo (dentro de rows) e a do body já estão ocultas via CSS. Manter setas do teclado e direcional do controle remoto como navegação principal.

---

## 4. Corrigir Navegação por Teclado/Controle Remoto

**Problema:** A navegação por setas não funciona corretamente.

**Solução:** Criar um hook `useUniversalNavigation` que:
- Intercepta ArrowUp/Down/Left/Right globalmente
- Encontra o próximo elemento focável na direção correta usando posição no DOM
- Funciona em cards, botões, menus, episódios
- Suporta Enter para ação primária (play/selecionar)

**Arquivos:** Novo `src/hooks/useUniversalNavigation.ts`, aplicar em `App.tsx`

---

## 5. Categorias Cinema — Ordem Exata do Supabase

**Problema:** As categorias na página Cinema não seguem a ordem definida.

**Solução:**
- Na página `Cinema.tsx`, definir a ordem exata das categorias: Lançamento 2026, Lançamento 2025, Ação, Aventura, Anime, Animação, Comédia, Drama, Dorama, Clássicos, Negritude, Crime, Policial, Família, Musical, Documentário, Faroeste, Ficção, Nacional, Religioso, Romance, Terror, Suspense, Adulto
- O `useSupabaseContent` já agrupa por categorias do Supabase. Na página Cinema, ordenar as categorias segundo a lista fixa acima
- Conteúdos com múltiplas categorias (ex: "Ação,Romance") já aparecem em ambas (lógica existente em `groupByDynamicCategories`)

**Arquivo:** `src/pages/Cinema.tsx`

---

## 6. Corrigir Trailers (Firefox/Chrome)

**Problema:** Trailers não funcionam em alguns navegadores.

**Análise:** Os trailers usam iframes do YouTube com `autoplay=1&mute=1`. O problema provável é:
- Falta `allow="autoplay"` nos iframes
- YouTube embed URLs podem precisar de `enablejsapi=1`
- Alguns bloqueadores podem interferir

**Solução:**
- Garantir que todos os iframes de trailer tenham `allow="autoplay; encrypted-media; fullscreen; picture-in-picture"`
- Adicionar `enablejsapi=1&origin=${window.location.origin}` às URLs do YouTube
- No `ContentCard.tsx` e `HeroBanner.tsx`, usar `frameBorder="0"` e `loading="lazy"`

**Arquivos:** `ContentCard.tsx`, `HeroBanner.tsx`

---

## 7. Corrigir Player de Séries

**Problema:** Player não exibe nada para séries.

**Análise:** Em `Details.tsx`, ao clicar "play" numa série, usa `supabaseItem?.identificador_archive`. Mas a tabela `series` não tem `url` — apenas `identificador_archive`. O problema é que o `handlePlayEpisode` constrói a URL do Archive.org mas pode não ser válida, ou o iframe não está preparado para esse tipo de embed.

**Solução:**
- No `NetflixPlayer.tsx`, detectar URLs do Archive.org e renderizar como iframe (não como `<video>`)
- Adicionar fallback: se `identificador_archive` vazio, usar trailer do TMDB
- Garantir que a URL do Archive.org use o formato correto: `https://archive.org/embed/{id}`

**Arquivos:** `NetflixPlayer.tsx`, `Details.tsx`

---

## 8. TV ao Vivo — Layout IPTV

**Problema:** Já tem grid de cards, mas precisa visual IPTV.

**Solução:** Reescrever `TvAoVivo.tsx`:
- Grid de 5 colunas com cards compactos (logo + nome)
- Agrupado por `grupo` do Supabase
- Visual estilo IPTV: fundo escuro, cards com borda, logo centralizado
- Player embutido na mesma página (split view) quando um canal é selecionado
- Canal ativo destacado

**Arquivo:** `src/pages/TvAoVivo.tsx`

---

## 9. Corrigir Filmes Kids e Séries Kids (páginas vazias)

**Problema:** Os filtros `cat.id === "kids-movies"` e `cat.id === "kids-series"` não encontram nada porque as categorias são prefixadas com `kids-movies-{genero}` e `kids-series-{genero}`.

**Solução:** Mudar filtros para `cat.id.startsWith("kids-movies")` e `cat.id.startsWith("kids-series")`.

**Arquivos:** `FilmesKids.tsx`, `SeriesKids.tsx`

---

## 10. Perfil do Usuário com Avatar

**Solução:**
- Criar página/modal de perfil acessível pelo ícone do usuário na Navbar
- Campos: nome de exibição, avatar (upload de foto ou tirar foto via câmera)
- Criar bucket `avatars` no Supabase Storage
- Adicionar colunas `display_name` e `avatar_url` à tabela `profiles`
- Upload de imagem via input file ou MediaDevices API (câmera)

**Arquivos:** Novo `src/pages/Profile.tsx`, migração SQL, `Navbar.tsx`

---

## 11. Busca sem Acentuação

**Problema:** A busca não normaliza acentuação.

**Solução:** Adicionar função `normalizeText` que remove diacríticos:
```ts
const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
```
Aplicar tanto na query quanto nos títulos/gêneros.

**Arquivo:** `Search.tsx`

---

## 12. Redesign do Painel Admin (CMS Style)

**Solução:** Reescrever `Admin.tsx` baseado no HTML fornecido:
- Sidebar com navegação (Dashboard, Usuários, Conteúdos, Planos, Configurações)
- Dashboard com cards de métricas (total usuários, ativos, receita)
- Tabela de usuários com ações (ativar/desativar, mudar plano)
- Seção para gerenciar `home_sections`
- Login inline no próprio componente (sem redirect para /plans)

**Arquivo:** `src/pages/Admin.tsx`

---

## 13. Migração SQL

Adicionar colunas ao profiles e criar bucket de storage:

```sql
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS avatar_url text;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public avatar read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Resumo de Arquivos

| Arquivo | Ação |
|---|---|
| `src/App.tsx` | Admin sem ProtectedRoute, nova rota Profile |
| `src/components/Navbar.tsx` | Reescrever: topo desktop, rodapé mobile |
| `src/pages/Admin.tsx` | Reescrever com CMS layout + login inline |
| `src/pages/Cinema.tsx` | Ordenação fixa de categorias |
| `src/pages/FilmesKids.tsx` | Fix filtro `startsWith` |
| `src/pages/SeriesKids.tsx` | Fix filtro `startsWith` |
| `src/pages/TvAoVivo.tsx` | Layout IPTV com player embutido |
| `src/pages/Search.tsx` | Normalizar acentos |
| `src/pages/Profile.tsx` | Novo — configurações de perfil + avatar |
| `src/components/ContentCard.tsx` | Fix trailers cross-browser |
| `src/components/HeroBanner.tsx` | Fix trailers cross-browser |
| `src/components/NetflixPlayer.tsx` | Suporte iframe para Archive.org |
| `src/hooks/useUniversalNavigation.ts` | Novo — navegação 4 direções |
| Migração SQL | Colunas profiles + bucket avatars |

**Total: ~14 arquivos modificados/criados, 1 migração SQL**

