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
// Default atualizado: gemini-1.5-flash foi descontinuado para chaves novas.
const MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.0-flash";

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

  // Monta o prompt: instruções da psicóloga (o "formato") + os dados em JSON.
  const prompt = [
    "Você é um assistente que redige rascunhos de relatórios para uma psicóloga infantil.",
    "Escreva SOMENTE com base nos dados fornecidos. NÃO invente informações que não estejam nos dados.",
    "Se algum dado estiver ausente, omita a seção correspondente em vez de inventar.",
    "",
    `Tipo de relatório: ${tipo}`,
    "",
    "== Instruções de formato definidas pela profissional ==",
    instrucoes,
    "",
    "== Dados (JSON) ==",
    JSON.stringify(payload, null, 2),
    "",
    "Produza apenas o texto do relatório, pronto para revisão.",
  ].join("\n");

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4 },
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
