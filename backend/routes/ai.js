const express = require("express");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

dotenv.config();

const router = express.Router();
router.use(authenticateToken);

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada no ambiente do servidor.");
  }
  return new GoogleGenAI({ apiKey });
};

// GET /ai/test
router.get("/test", async (req, res) => {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: "Responda exclusivamente com: OK",
      config: { temperature: 0 },
    });

    return res.json({
      success: true,
      message: "Serviço de Inteligência Financeira operacional.",
      model: GEMINI_MODEL,
      response: response.text?.trim(),
    });
  } catch (error) {
    console.error("❌ Falha no teste do motor de IA:", error);
    return res.status(500).json({
      success: false,
      message: "Falha de conectividade com o motor de IA.",
      error: error.message,
    });
  }
});

// POST /ai/insights
router.post("/insights", async (req, res) => {
  try {
    const userId = req.user.id;
    const ai = getGeminiClient();

    const transactionsResult = await pool.query(
      `
      SELECT
        t.id,
        t.client_id,
        c.company_name AS client_name,
        t.sector_id,
        s.name AS sector_name,
        t.type,
        t.payer,
        t.description,
        t.amount,
        t.transaction_date
      FROM transactions t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN sectors s ON t.sector_id = s.id
      WHERE t.user_id = $1
      ORDER BY t.transaction_date DESC
      LIMIT 100
      `,
      [userId],
    );

    const transactions = transactionsResult.rows;

    if (transactions.length === 0) {
      return res.json({
        success: true,
        summary:
          "Volume de dados insuficiente para emissão de relatório contábil.",
        insights: [],
        metrics: {
          totalTransactions: 0,
          totalIncome: 0,
          totalExpenses: 0,
          balance: 0,
          profitMargin: 0,
        },
        generatedAt: new Date().toISOString(),
      });
    }

    let totalIncome = 0;
    let totalExpenses = 0;
    const incomeByClient = {};
    const expensesBySector = {};

    transactions.forEach((t) => {
      const amount = Number(t.amount || 0);
      if (t.type === "income" && t.payer === "client") {
        totalIncome += amount;
        const cli = t.client_name || "Sem identificação";
        incomeByClient[cli] = (incomeByClient[cli] || 0) + amount;
      }
      if (t.type === "expense" && t.payer === "user") {
        totalExpenses += amount;
        const sec = t.sector_name || "Geral";
        expensesBySector[sec] = (expensesBySector[sec] || 0) + amount;
      }
    });

    const balance = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    const payloadAudit = {
      indicadores: {
        totalReceitas: totalIncome,
        totalDespesas: totalExpenses,
        saldoLiquido: balance,
        margemOperacionalPercentual: profitMargin.toFixed(2),
        totalLancamentos: transactions.length,
      },
      faturamentoPorCliente: Object.entries(incomeByClient).slice(0, 5),
      despesasPorCentroDeCusto: Object.entries(expensesBySector).slice(0, 5),
      ultimosLancamentos: transactions.slice(0, 8),
    };

    const promptSystem = `
Você é um Auditor Contábil e CFO Executivo. Analise os dados fornecidos com extremo rigor técnico.
Identifique: exposição a risco, concentração em clientes, centros de custo com desvio e oportunidades de eficiência.

DIRETRIZES:
1. Baseie-se ESTRITAMENTE nos dados numéricos fornecidos. Não invente fatos ou entidades.
2. Seja objetivo e institucional.
3. Retorne EXCLUSIVAMENTE um objeto JSON válido seguindo a estrutura abaixo.

SCHEMA:
{
  "summary": "Resumo executivo de alto nível sobre a saúde financeira em até 3 frases.",
  "insights": [
    {
      "title": "Título conciso",
      "description": "Explicação técnica da causa e recomendação acionável.",
      "type": "positive" | "negative" | "warning" | "neutral"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${promptSystem}\n\nDADOS CONSOLIDADOS:\n${JSON.stringify(payloadAudit, null, 2)}`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text?.trim();
    if (!rawText) throw new Error("A IA retornou conteúdo vazio.");

    const parsed = JSON.parse(rawText);

    return res.json({
      success: true,
      summary: parsed.summary?.trim() || "Análise concluída com sucesso.",
      insights: Array.isArray(parsed.insights)
        ? parsed.insights.slice(0, 5)
        : [],
      metrics: {
        totalTransactions: transactions.length,
        totalIncome,
        totalExpenses,
        balance,
        profitMargin,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erro no processamento de insights:", error);
    return res.status(500).json({
      success: false,
      message: "Falha ao gerar diagnóstico financeiro automatizado.",
      error: process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
});

module.exports = router;
