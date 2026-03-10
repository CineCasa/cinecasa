

# Plano: Corrigir Build Errors + Remover Barra de Rolagem

## 1. Corrigir Build Error no AuthProvider

O `profiles` não existe no tipo `Database`. Solução: usar cast `as any` no client Supabase para a query de profiles.

**Arquivo:** `src/components/AuthProvider.tsx` — linha 25-28, alterar para:
```ts
const { data, error } = await (supabase as any)
  .from("profiles")
  .select("*")
  .eq("id", userId)
  .single();
```

## 2. Remover Barra de Rolagem (manter Navbar)

Ocultar a scrollbar do navegador em todo o sistema, mantendo o scroll funcional.

**Arquivo:** `src/index.css` — adicionar no `body`:
```css
body {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
body::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}
```

Isso remove a barra de rolagem visível mas mantém o scroll por touch, trackpad e teclado funcionando normalmente.

