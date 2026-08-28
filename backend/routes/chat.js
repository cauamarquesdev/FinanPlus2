const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

router.post("/", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user?.id || req.user?.userId || req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const { message, conversationHistory = [] } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Mensagem vazia." });
    }

    // 1. Coleta dados financeiros em tempo real
    const [txResult, clientResult, sectorResult] = await Promise.all([
      pool.query(
        `
        SELECT 
          t.type,
          t.description,
          t.amount,
          t.transaction_date,
          c.company_name AS client_name,
          s.name AS sector_name
        FROM transactions t
        LEFT JOIN clients c ON t.client_id = c.id
        LEFT JOIN sectors s ON t.sector_id = s.id
        WHERE t.user_id = $1
        ORDER BY t.transaction_date DESC
        LIMIT 100
        `,
        [user_id],
      ),
      pool.query(
        "SELECT company_name, status, type FROM clients WHERE user_id = $1",
        [user_id],
      ),
      pool.query("SELECT name FROM sectors ORDER BY name ASC"),
    ]);

    const transactions = txResult.rows;
    const clients = clientResult.rows;
    const sectors = sectorResult.rows;

    const totalIncome = transactions
      .filter((t) => String(t.type).toLowerCase() === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalExpense = transactions
      .filter((t) => String(t.type).toLowerCase() === "expense")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const balance = totalIncome - totalExpense;

    const formatBRL = (v) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(v);

    const apiKey = (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      ""
    ).trim();
    const targetModel = (
      process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"
    ).trim();

    if (!apiKey) {
      return res.status(500).json({
        reply: `⚠️ Chave GEMINI_API_KEY não encontrada no arquivo .env do backend.`,
      });
    }

    // 2. Prompt Estruturado do Sistema
    const systemPrompt = `Você é o CFO Copilot, um consultor financeiro executivo e parceiro de negócios inteligente da plataforma FinanPlus.
Você conversa em primeira pessoa como um diretor humano: direto, amigável, técnico e analítico.

DADOS REAIS DA EMPRESA EM TEMPO REAL:
- Saldo Líquido Atual: ${formatBRL(balance)} (R$ ${balance.toFixed(2)})
- Total de Receitas (Créditos): ${formatBRL(totalIncome)} (R$ ${totalIncome.toFixed(2)})
- Total de Despesas (Débitos): ${formatBRL(totalExpense)} (R$ ${totalExpense.toFixed(2)})
- Total de Lançamentos Registrados: ${transactions.length}
- Clientes Cadastrados (${clients.length}): ${clients.map((c) => c.company_name).join(", ") || "Nenhum"}
- Centros de Custo: ${sectors.map((s) => s.name).join(", ") || "Geral"}

ÚLTIMAS TRANSAÇÕES:
${transactions
  .slice(0, 20)
  .map(
    (t) =>
      `- [${t.transaction_date}] ${t.type === "income" ? "RECEITA" : "DESPESA"}: ${t.description} | ${formatBRL(Number(t.amount))} | Setor: ${t.sector_name || "Geral"} | Cliente: ${t.client_name || "Nenhum"}`,
  )
  .join("\n")}

DIRETRIZES:
1. Responda ESTRITAMENTE ao que foi perguntado de forma natural e analítica.
2. Quando o usuário fizer simulações matemáticas (ex: "Se a receita oscilar +5% ou -5% em 6 meses, qual será o saldo final?"), realize os cálculos passo a passo com base nos dados reais acima e apresente a projeção exata.
3. Use Markdown limpo (**negrito** para valores numéricos e tópicos quando necessário). Responda sempre em português do Brasil.`;

    // 3. Montagem do Histórico
    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt + "\n\nEntendido o papel?" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Sim! Estou com os dados da empresa prontos para conversar e simular cenários.",
          },
        ],
      },
    ];

    if (Array.isArray(conversationHistory)) {
      for (const chat of conversationHistory.slice(-8)) {
        if (chat.sender === "user" && chat.text) {
          contents.push({ role: "user", parts: [{ text: chat.text }] });
        } else if (chat.sender === "bot" && chat.text) {
          contents.push({ role: "model", parts: [{ text: chat.text }] });
        }
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // 4. Executa a requisição priorizando o GEMINI_MODEL do .env
    const modelsToTry = [
      targetModel,
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash",
      "gemini-2.5-flash",
    ];

    let replyText = null;
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
        const aiRes = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1000,
            },
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          replyText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            console.log(`✅ Respondido com sucesso via modelo: ${modelName}`);
            break;
          }
        } else {
          lastError = await aiRes.text();
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    if (!replyText) {
      console.error("❌ Falha na API Gemini:", lastError);
      throw new Error(`Falha nos modelos Gemini: ${lastError}`);
    }

    return res.json({ reply: replyText.trim() });
  } catch (error) {
    console.error("❌ Erro no CFO Copilot:", error.message);
    return res.status(500).json({
      message: "Falha na comunicação com o modelo de IA.",
      detail: error.message,
    });
  }
});

module.exports = router;
