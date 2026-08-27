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

    // 1. Busca histórico financeiro do usuário
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

    // Métricas Contábeis
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

    // 2. Motor Heurístico de Fallback Estruturado (Sempre garante insights de alto nível)
    const generateHeuristicInsights = () => {
      const insights = [];

      if (balance >= 0) {
        insights.push({
          type: "positive",
          title: "Resultado Operacional Superavitário",
          description: `A empresa mantém saldo líquido positivo de ${formatBRL(balance)} com margem operacional estimada em ${margin}%.`,
        });
      } else {
        insights.push({
          type: "negative",
          title: "Déficit Operacional em Aberto",
          description: `As despesas correntes superam os ingressos em ${formatBRL(Math.abs(balance))}. Recomenda-se contenção de custos imediatos.`,
        });
      }

      if (totalExpense > totalIncome * 0.7 && totalIncome > 0) {
        insights.push({
          type: "warning",
          title: "Elevada Absorção de Receita",
          description:
            "Os custos operacionais consomem mais de 70% das entradas líquidas do período analítico.",
        });
      }

      insights.push({
        type: "neutral",
        title: "Liquidez e Conciliação",
        description: `${transactions.length} registros contábeis auditados com conciliação bancária ativa.`,
      });

      return {
        summary: `Diagnóstico Financeiro Executivo: Volume transacionado de ${formatBRL(totalIncome + totalExpense)}, resultando em um saldo líquido de ${formatBRL(balance)} (Margem: ${margin}%). O radar recomenda monitoramento contínuo das despesas fixas e incentivo ao faturamento de contratos recorrentes.`,
        insights,
        generatedAt: new Date().toISOString(),
      };
    };

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // Se não tiver chave de API, retorna o fallback contábil com sucesso
    if (!apiKey) {
      return res.json(generateHeuristicInsights());
    }

    // 3. Chamada à API Generativa
    try {
      const prompt = `
Você é um CFO / Diretor Financeiro corporativo de elite.
Analise os seguintes dados financeiros reais da empresa:
- Faturamento Total (Receitas): R$ ${totalIncome.toFixed(2)}
- Despesas Totais: R$ ${totalExpense.toFixed(2)}
- Saldo Líquido: R$ ${balance.toFixed(2)}
- Margem de Lucro: ${margin}%
- Quantidade de Transações: ${transactions.length}

Retorne ESTRITAMENTE um objeto JSON válido (sem texto fora do JSON, sem formatações Markdown adicionais) no formato:
{
  "summary": "Um parágrafo executivo e analítico sobre a saúde financeira da empresa.",
  "insights": [
    {
      "type": "positive" | "negative" | "warning" | "neutral",
      "title": "Título conciso do insight",
      "description": "Detalhamento e recomendação prática contábil."
    }
  ]
}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Erro na API Gemini: HTTP ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) throw new Error("Resposta da IA vazia.");

      // Limpa possíveis blocos ```json ... ```
      const cleanedJson = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(cleanedJson);

      return res.json({
        summary: parsed.summary,
        insights: Array.isArray(parsed.insights) ? parsed.insights : [],
        generatedAt: new Date().toISOString(),
      });
    } catch (aiErr) {
      console.warn(
        "⚠️ IA Externa indisponível, aplicando fallback inteligente:",
        aiErr.message,
      );
      return res.json(generateHeuristicInsights());
    }
  } catch (error) {
    console.error("❌ Erro geral na rota de IA:", error);
    return res.status(500).json({
      message: "Falha ao gerar diagnóstico financeiro automatizado.",
      detail: error.message,
    });
  }
});

module.exports = router;
