# Edge Function: gerar-relatorio

Gera o texto-rascunho de um relatório usando o Google Gemini. A chave da IA fica
como **secret** da função (nunca no front).

## Setup (rodar uma vez, na raiz do projeto)

Precisa do PROJECT_REF do seu Supabase (Settings > General > Reference ID) e da
sua chave do Gemini (Google AI Studio).

```bash
# 1. Login na CLI (abre o navegador)
npx supabase login

# 2. Vincular o projeto local ao seu projeto Supabase
npx supabase link --project-ref SEU_PROJECT_REF

# 3. Cadastrar a chave do Gemini como secret da função
npx supabase secrets set GEMINI_API_KEY=SUA_CHAVE_GEMINI

# 4. Publicar a função
npx supabase functions deploy gerar-relatorio
```

## Testar

Depois de publicada, o app chama a função via `supabase.functions.invoke('gerar-relatorio')`.
Basta ir num paciente > Relatório > escolher um modelo > "Gerar com IA".

## Atualizar

Após editar `index.ts`, rode de novo:

```bash
npx supabase functions deploy gerar-relatorio
```
