const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

router.post("/insights", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user?.id || req.user?.userId || req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const txQuery = await pool.query(
      `
      SELECT 
        t.*,
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
    );

    const transactions = txQuery.rows;

    const totalIncome = transactions
      .filter((t) => String(t.type).toLowerCase() === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalExpense = transactions
      .filter((t) => String(t.type).toLowerCase() === "expense")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const balance = totalIncome - totalExpense;
    const margin =
      totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : "0.0";
    const formatBRL = (val) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(val);

    const apiKey = (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      ""
    ).trim();
    const targetModel = (
      process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"
    ).trim();

    const generateFallback = () => ({
      summary: `Diagnóstico Financeiro: Faturamento de ${formatBRL(totalIncome)}, Despesas de ${formatBRL(totalExpense)} e Saldo Líquido de ${formatBRL(balance)} (Margem: ${margin}%).`,
      insights: [
        {
          type: balance >= 0 ? "positive" : "negative",
          title:
            balance >= 0 ? "Resultado Superavitário" : "Déficit Operacional",
          description: `Saldo atual de ${formatBRL(balance)} com margem estimada em ${margin}%.`,
        },
        {
          type: "neutral",
          title: "Auditoria Contábil",
          description: `${transactions.length} lançamentos processados na base de dados.`,
        },
      ],
      generatedAt: new Date().toISOString(),
    });

    if (!apiKey) return res.json(generateFallback());

    try {
      const prompt = `
Você é um CFO corporativo. Analise estes dados:
- Receitas: R$ ${totalIncome.toFixed(2)}
- Despesas: R$ ${totalExpense.toFixed(2)}
- Saldo: R$ ${balance.toFixed(2)}
- Margem: ${margin}%
- Transações: ${transactions.length}

Retorne APENAS um JSON válido no formato:
{
  "summary": "Resumo executivo em 1 parágrafo",
  "insights": [
    {
      "type": "positive" | "negative" | "warning" | "neutral",
      "title": "Título conciso",
      "description": "Detalhamento e recomendação prática contábil."
    }
  ]
}
`;

      const modelsToTry = [
        targetModel,
        "gemini-3.5-flash-lite",
        "gemini-3.5-flash",
        "gemini-2.5-flash",
      ];
      let rawText = null;

      for (const model of modelsToTry) {
        try {
          const aiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey,
              },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.2,
                  responseMimeType: "application/json",
                },
              }),
            },
          );

          if (aiRes.ok) {
            const data = await aiRes.json();
            rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) break;
          }
        } catch (e) {
          // Próximo modelo
        }
      }

      if (!rawText) throw new Error("Falha ao obter resposta de insights.");

      const cleaned = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(cleaned);

      return res.json({
        summary: parsed.summary,
        insights: Array.isArray(parsed.insights) ? parsed.insights : [],
        generatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("⚠️ IA de insights usando fallback:", err.message);
      return res.json(generateFallback());
    }
  } catch (error) {
    return res.status(500).json({ message: "Erro geral nos insights." });
  }
});

module.exports = router;
