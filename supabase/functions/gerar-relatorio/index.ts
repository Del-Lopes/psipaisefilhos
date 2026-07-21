// ============================================================================
//  Edge Function: gerar-relatorio
//  Recebe dados do paciente/sessão + instruções e pede à IA (Google Gemini)
//  um texto-RASCUNHO de relatório. A chave da IA fica como secret do projeto,
//  NUNCA no front. Exige usuário autenticado (JWT do Supabase).
//
//  Deploy:  npx supabase functions deploy gerar-relatorio
//  Secret:  npx supabase secrets set GEMINI_API_KEY=xxxxx
// ============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
// Permite trocar o modelo por secret (GEMINI_MODEL) sem redeploy.
// Default: gemini-flash-latest (o gemini-2.0-flash ficou com free tier
// zerado nesta conta; o 1.5-flash foi descontinuado para chaves novas).
const MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-flash-latest";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  // Exige Authorization (JWT do usuário logado). O gateway do Supabase já valida
  // o JWT quando verify_jwt está ativo; aqui reforçamos a presença do header.
  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "Não autorizado" }, 401);

  if (!GEMINI_API_KEY) {
    return json({ error: "GEMINI_API_KEY não configurada na função." }, 500);
  }

  let body: { tipo?: string; payload?: unknown; instrucoes?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Corpo inválido." }, 400);
  }

  const { tipo, payload, instrucoes } = body;
  if (!payload || !instrucoes) {
    return json({ error: "Faltam dados (payload/instrucoes)." }, 400);
  }

  // Monta o prompt: diretrizes de escrita + instruções da psicóloga + dados.
  const prompt = [
    "Você redige o rascunho de um relatório psicológico infantil, na voz de uma psicóloga experiente escrevendo para os pais/responsáveis da criança.",
    "",
    "COMO ESCREVER (tom humano e profissional):",
    "- Escreva em prosa fluida e acolhedora, em primeira pessoa (\"observei\", \"durante nossos encontros\"), como quem conhece a criança de verdade.",
    "- Evite tom robótico, genérico ou de checklist. Prefira frases conectadas e transições naturais entre as ideias.",
    "- Use os dados como base para NARRAR o desenvolvimento da criança, não apenas listá-los. Traga exemplos concretos das sessões quando existirem nos dados.",
    "- Equilibre técnica e calor humano: quando usar um termo técnico, explique-o em linguagem simples.",
    "- Comece valorizando as conquistas da criança antes de apontar o que estimular. Transmita esperança e um plano.",
    "- Varie o vocabulário; evite repetir as mesmas expressões. Não use emojis.",
    "",
    "REGRAS DE INTEGRIDADE:",
    "- Baseie-se ESTRITAMENTE nos dados fornecidos. NÃO invente fatos, nomes, datas ou resultados.",
    "- Se um dado não existir, simplesmente não fale dele (não escreva \"não informado\").",
    "- Não faça diagnóstico. Trata-se de avaliação de desenvolvimento e recomendações.",
    "",
    "FORMATO DE SAÍDA:",
    "- Use Markdown: títulos com ## (e ### para subtítulos), **negrito** para destaques, listas com - quando fizer sentido. NÃO use # (título nível 1).",
    "- Produza apenas o texto do relatório, pronto para revisão da profissional.",
    "",
    `Tipo de relatório: ${tipo}`,
    "",
    "== Instruções de conteúdo/estrutura definidas pela profissional ==",
    instrucoes,
    "",
    "== Dados da criança e do acompanhamento (JSON) ==",
    JSON.stringify(payload, null, 2),
  ].join("\n");

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 },
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return json({ error: "Falha na API de IA.", detail }, 502);
    }

    const data = await resp.json();
    const texto =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ??
      "";

    if (!texto.trim()) return json({ error: "A IA não retornou texto." }, 502);

    return json({ texto });
  } catch (e) {
    return json({ error: "Erro ao chamar a IA.", detail: String(e) }, 500);
  }
});
