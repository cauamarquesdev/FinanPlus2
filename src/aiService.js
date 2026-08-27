const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Gera diagnóstico analítico e insights executivos com base nos dados contábeis consolidados.
 * @param {Object} financialData Dados financeiros agregados
 * @returns {Promise<{ summary: string, insights: Array, generatedAt: string }>}
 */
const generateFinancialInsights = async (financialData) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "A chave OPENAI_API_KEY não foi configurada nas variáveis de ambiente.",
    );
  }

  const prompt = `
Você é um Diretor Financeiro (CFO) e Auditor Contábil Sênior.
Analise os dados financeiros abaixo com rigor técnico, identificando padrões de liquidez, exposição a risco, concentração de faturamento e oportunidades de redução de custos.

DADOS FINANCEIROS CONSOLIDADOS:
${JSON.stringify(financialData, null, 2)}

DIRETRIZES DE AUDITORIA:
1. Baseie-se ESTRITAMENTE nos números fornecidos. Não invente valores, entidades ou percentuais.
2. Identifique anomalias no fluxo de caixa, dependência excessiva de clientes específicos ou desequilíbrio em centros de custos.
3. Produza um resumo executivo sintetizando o momento da empresa em até 3 frases.
4. Retorne entre 3 e 5 insights analíticos acionáveis.
5. Utilize tom institucional, assertivo e executivo em português do Brasil.

SCHEMA DE RETORNO OBRIGATÓRIO (JSON estrito):
{
  "summary": "Resumo executivo de alto nível sobre a saúde financeira consolidada.",
  "insights": [
    {
      "title": "Título curto e profissional",
      "description": "Explicação técnica com o diagnóstico do impacto e uma recomendação de ação objetiva.",
      "type": "positive" | "negative" | "warning" | "neutral",
      "priority": "high" | "medium" | "low"
    }
  ]
}
`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // ou "gpt-4o"
      messages: [
        {
          role: "system",
          content:
            "Você é um motor analítico financeiro estrito. Suas respostas devem ser exclusivamente em JSON válido de acordo com o schema fornecido.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Baixa temperatura para garantir aderência aos dados e eliminar alucinações
    });

    const rawContent = response.choices?.[0]?.message?.content?.trim();

    if (!rawContent) {
      throw new Error("O motor de IA retornou uma resposta vazia.");
    }

    const parsed = JSON.parse(rawContent);

    if (!parsed.insights || !Array.isArray(parsed.insights)) {
      throw new Error(
        "Estrutura de insights incompatível com o schema contratado.",
      );
    }

    return {
      summary:
        parsed.summary ||
        "Diagnóstico financeiro consolidado gerado com sucesso.",
      insights: parsed.insights.slice(0, 5),
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Falha na execução do serviço de IA contábil:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Falha interna ao processar diagnóstico financeiro.",
    );
  }
};

module.exports = {
  generateFinancialInsights,
};
