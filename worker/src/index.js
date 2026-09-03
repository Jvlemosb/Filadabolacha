export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Cabeçalhos de CORS: permitem que o site (em outro domínio) chame essa API
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // O navegador manda uma requisição OPTIONS antes do POST, para checar o CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // GET /api/fila -> devolve a fila inteira, ordenada
      if (url.pathname === "/api/fila" && request.method === "GET") {
        const fila = await buscarFila(env.DB);
        return jsonResponse(fila, corsHeaders);
      }

      // POST /api/confirmar -> quem está na frente entregou a bolacha e vai pro final
      if (url.pathname === "/api/confirmar" && request.method === "POST") {
        const pessoaAnterior = await moverParaFinal(env.DB);
        const fila = await buscarFila(env.DB);
        return jsonResponse({ pessoaAnterior, fila }, corsHeaders);
      }

      // POST /api/pular -> quem está na frente pula a vez e vai pro final
      if (url.pathname === "/api/pular" && request.method === "POST") {
        const pessoaAnterior = await moverParaFinal(env.DB);
        const fila = await buscarFila(env.DB);
        return jsonResponse({ pessoaAnterior, fila }, corsHeaders);
      }

      // POST /api/adicionar -> adiciona um novo colega no final da fila
      if (url.pathname === "/api/adicionar" && request.method === "POST") {
        const corpo = await request.json();
        const nome = (corpo.nome || "").trim();

        if (!nome) {
          return jsonResponse({ erro: "Nome não pode ser vazio" }, corsHeaders, 400);
        }

        const maiorOrdem = await env.DB
          .prepare("SELECT MAX(ordem) as maxOrdem FROM membros")
          .first();
        const novaOrdem = (maiorOrdem.maxOrdem ?? -1) + 1;

        await env.DB
          .prepare("INSERT INTO membros (nome, ordem) VALUES (?, ?)")
          .bind(nome, novaOrdem)
          .run();

        const fila = await buscarFila(env.DB);
        return jsonResponse({ fila }, corsHeaders);
      }

      return jsonResponse({ erro: "Rota não encontrada" }, corsHeaders, 404);
    } catch (erro) {
      return jsonResponse({ erro: erro.message }, corsHeaders, 500);
    }
  },
};

// Busca a fila inteira, ordenada (o primeiro da lista é sempre "a vez")
async function buscarFila(db) {
  const { results } = await db
    .prepare("SELECT id, nome FROM membros ORDER BY ordem ASC")
    .all();
  return results;
}

// Pega quem está na frente da fila e manda pro final (nova maior ordem + 1)
async function moverParaFinal(db) {
  const frente = await db
    .prepare("SELECT id, nome FROM membros ORDER BY ordem ASC LIMIT 1")
    .first();

  if (!frente) return null;

  const maiorOrdem = await db
    .prepare("SELECT MAX(ordem) as maxOrdem FROM membros")
    .first();
  const novaOrdem = (maiorOrdem.maxOrdem ?? 0) + 1;

  await db
    .prepare("UPDATE membros SET ordem = ? WHERE id = ?")
    .bind(novaOrdem, frente.id)
    .run();

  return frente.nome;
}

function jsonResponse(dados, corsHeaders, status = 200) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}
