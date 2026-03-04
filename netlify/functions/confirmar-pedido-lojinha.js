exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { pedidoId, senha } = JSON.parse(event.body);

    // Verifica senha admin
    if (senha !== process.env.ADMIN_SENHA) {
      return { statusCode: 401, body: JSON.stringify({ error: "Não autorizado" }) };
    }

    const supabaseUrl        = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    console.log("URL:", supabaseUrl);
    console.log("KEY (primeiros 20 chars):", supabaseServiceKey?.slice(0, 20));

    // Busca o pedido para calcular o valor
    const getRes = await fetch(
      `${supabaseUrl}/rest/v1/pedidos?id=eq.${pedidoId}&select=pecas,pagamento_status,forma_pagamento`,
      {
        headers: {
          apikey:        supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      }
    );

    if (!getRes.ok) {
      const errBody = await getRes.text();
      throw new Error(`Erro ao buscar pedido (status ${getRes.status}): ${errBody}`);
    }
    const [pedido] = await getRes.json();
    if (!pedido) throw new Error("Pedido não encontrado");

    const statusesValidos = ["pendente_credito_lojinha", "pendente_pix_lojinha"];
    if (!statusesValidos.includes(pedido.pagamento_status)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Pedido não está pendente na lojinha" }),
      };
    }

    const isPix = pedido.pagamento_status === "pendente_pix_lojinha";

    // Preços das peças — mantenha sincronizado com PECAS_CONFIG do frontend
    const PRECOS = {
      "Blusa": 60, "Regata": 30, "Short": 60,
      "Calça Moletom": 90, "Blusa Moletom": 90,
    };

    let totalBase = 0;
    for (const [nome, preco] of Object.entries(PRECOS)) {
      const tamanhos = pedido.pecas?.[nome]?.tamanhos || {};
      for (const qty of Object.values(tamanhos)) {
        totalBase += (qty || 0) * preco;
      }
    }

    // PIX sem acréscimo, cartão +5%
    const valorPago = parseFloat((isPix ? totalBase : totalBase * 1.05).toFixed(2));
    const formaPagamento = isPix ? "pix_lojinha" : "credito_lojinha";

    // Atualiza para pago
    const updateRes = await fetch(
      `${supabaseUrl}/rest/v1/pedidos?id=eq.${pedidoId}`,
      {
        method: "PATCH",
        headers: {
          apikey:         supabaseServiceKey,
          Authorization:  `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
          Prefer:         "return=minimal",
        },
        body: JSON.stringify({
          pagamento_status: "pago",
          forma_pagamento:  formaPagamento,
          valor_pago:       valorPago,
        }),
      }
    );

    if (!updateRes.ok) throw new Error("Erro ao atualizar pedido");

    console.log(`Pedido ${pedidoId} confirmado na lojinha | Forma: ${formaPagamento} | Valor: ${valorPago}`);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true }),
    };

  } catch (err) {
    console.error("Erro confirmar lojinha:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};