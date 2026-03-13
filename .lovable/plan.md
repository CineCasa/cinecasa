

# Plano: Reestruturação Completa do CineCasa

Este plano aborda todas as solicitações em ordem de dependência.

---

## 1. Fluxo de Navegação: Plans → Login → Home

**Problema:** O fluxo atual funciona mas precisa de ajustes para reconhecer assinatura ativa.

**Alterações:**
- `ProtectedRoute.tsx`: Se `is_active === true` e tem plano, ir direto para home (pular plans)
- `Plans.tsx`: Adicionar botão "Já tenho plano" que redireciona para `/login`
- Se usuário já logado e ativo, redirecionar automaticamente de `/plans` e `/login` para `/`

**Arquivos:** `ProtectedRoute.tsx`, `Plans.tsx`, `Login.tsx`, `App.tsx`

---

## 2. Acesso Somente Após Liberação do Admin

**Já funciona:** O `ProtectedRoute` checa `is_active`. Novos usuários são criados com `is_active: false` pelo trigger `handle_new_user`. O admin ativa no painel.

**Ajuste necessário:** No `ProtectedRoute`, se `session` existe mas `is_active === false`, mostrar tela de "Aguardando ativação" em vez de redirecionar para plans.

---

## 3. TV ao Vivo - Cards Pequenos por Categoria

**Alteração:** Reescrever `TvAoVivo.tsx` para agrupar canais por `grupo` (coluna do Supabase) e exibir em grid de 5 por linha com cards pequenos (logo + nome).

**Arquivo:** `src/pages/TvAoVivo.tsx` (reescrever), novo componente `TvChannelCard.tsx`

---

## 4. Sistema Dinâmico de Categorias do Supabase

**Problema atual:** O `useSupabaseContent` usa `MASTER_CATEGORIES` hardcoded. Mudanças no Supabase não refletem automaticamente.

**Solução:** Remover `MASTER_CATEGORIES`. Em vez disso:
- Ler a coluna `category` (cinema) e `genero` (kids/series) direto do Supabase
- Agrupar itens pelas categorias reais encontradas no banco
- Quando um item tem múltiplas categorias (ex: "Ação,Romance"), colocá-lo em ambas
- Ordenar categorias na ordem em que aparecem no banco
- Suportar até 200k itens (já tem paginação de 1000)

**Arquivo:** `src/hooks/useSupabaseContent.ts` (reescrever lógica de categorização)

---

## 5. Seções da Home (todas com 5 capas)

Reescrever `Index.tsx` com as seções na ordem exata solicitada:

1. **Continuar Assistindo** - já existe, manter
2. **Lançamentos & Novidades** - filtrar categorias "Lançamento 2025" e "Lançamento 2026"
3. **Exclusivos para Você** - analisar `paixaohist` do localStorage, identificar gêneros mais assistidos, filtrar items que combinam
4. **Dinheiro Importa!** - buscar no TMDB por "dinheiro|finanças|money|investimento", cruzar com Supabase, badge "Em Breve" se não existir
5. **Negritude em Alta** - filtrar categoria "Negritude"
6. **Romances para se Inspirar** - filtrar categoria "Romance"
7. **Prepare a Pipoca** - buscar trending series no TMDB, cruzar com Supabase, badge "Em Breve", sem duplicatas de temporadas
8. **Como é bom ser criança** - filtrar categoria "Infantil" (filmes_kids + series_kids)
9. **Vencedores de Oscar** - buscar no TMDB filmes com awards/oscar, cruzar com banco
10. **Travesseiro e Edredon** - buscar gêneros leves (família, romance, comédia) no banco e TMDB
11. **Categorias dinâmicas do Supabase** - todas as categorias restantes

**Arquivos:** `Index.tsx`, novos componentes para seções especiais (FinanceRow, OscarRow, etc.)

---

## 6. Trailers em Todas as Capas (ContentCard)

**Atual:** Já carrega trailers no hover. Manter.

**Ajuste:** Garantir que `mute=1` nos cards (para não incomodar).

---

## 7. Trailers no HeroBanner - Sem Som + Rotação Infinita

**Atual:** Já tem rotação a cada 15s e trailer automático.

**Ajustes:**
- Confirmar `mute=1` no iframe do banner (sem som no banner)
- Remover limite de rotação (já é infinito com `%`)
- Reduzir intervalo se necessário

---

## 8. Player: Diferenciar Filme vs Série

**Filme:** Abrir player direto com `url` do Supabase
**Série:** Redirecionar para `/details/series/{tmdbId}` com lista de episódios

**Alterações em:** `ContentCard.tsx` (botão "Assistir"), `HeroBanner.tsx`

---

## 9. Página de Detalhes das Séries

**Já existe** em `Details.tsx` com temporadas e episódios do TMDB. 

**Ajustes:**
- Ao clicar num episódio, abrir o player com URL do Supabase (usando `identificador_archive`)
- Melhorar layout de episódios

---

## 10. Contador de Conteúdos Real

Criar `useContentCounts.ts` com queries COUNT DISTINCT diretas ao Supabase para cada tabela. Exibir no HeroBanner ou footer.

---

## 11. Supabase: Criar/Renomear Categorias Automaticamente

**Como funciona:** O sistema já lê categorias da coluna `category`/`genero` do Supabase. Com a refatoração do item 4, qualquer mudança no Supabase (renomear categoria, criar nova) será refletida automaticamente no próximo carregamento.

**Para criar seções personalizadas via Supabase:** Criar tabela `home_sections` com campos: `nome`, `tipo` (categoria/tmdb_search/manual), `query`, `ordem`, `ativo`. O sistema lê essa tabela e monta a home dinamicamente.

**Migração SQL necessária:**
```sql
CREATE TABLE home_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo text NOT NULL DEFAULT 'categoria',
  query text,
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE home_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON home_sections FOR SELECT TO public USING (true);
CREATE POLICY "Admin manage" ON home_sections FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
```

---

## Resumo de Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/ProtectedRoute.tsx` | Lógica de ativo/inativo/plans |
| `src/pages/Plans.tsx` | Botão "Já tenho plano", redirect se ativo |
| `src/pages/Login.tsx` | Redirect se já ativo |
| `src/hooks/useSupabaseContent.ts` | Categorias dinâmicas do Supabase |
| `src/pages/Index.tsx` | Todas as seções novas |
| `src/pages/TvAoVivo.tsx` | Grid de cards pequenos |
| `src/pages/Details.tsx` | Player de episódios |
| `src/components/ContentCard.tsx` | Filme vs Série routing |
| `src/components/HeroBanner.tsx` | Trailer mute, rotação |
| `src/hooks/useContentCounts.ts` | Novo - contagem real |
| `src/hooks/useHomeSections.ts` | Novo - seções dinâmicas |
| Migração SQL | Tabela `home_sections` |
| Novos componentes | `FinanceRow`, `OscarRow`, `TvChannelCard`, etc. |

**Total: ~15 arquivos modificados/criados, 1 migração SQL**

