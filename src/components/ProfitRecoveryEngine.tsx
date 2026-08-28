import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Flame,
  ArrowRight,
  Copy,
  Check,
  Percent,
  RefreshCw,
  Wallet,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Transaction, Client } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "";

interface WasteOpportunity {
  id: string;
  category: "supplier_increase" | "subscription_leak" | "bank_fees";
  title: string;
  description: string;
  monthlyImpact: number;
  annualSavings: number;
  recommendedAction: string;
  negotiationTemplate: string;
}

export const ProfitRecoveryEngine: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"waste" | "treasury" | "pricing">(
    "waste",
  );

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  const loadData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      const [txRes, cliRes] = await Promise.allSettled([
        fetch(`${API_URL}/transactions`, { headers }),
        fetch(`${API_URL}/clients`, { headers }),
      ]);

      if (txRes.status === "fulfilled" && txRes.value.ok) {
        setTransactions(await txRes.value.json());
      }
      if (cliRes.status === "fulfilled" && cliRes.value.ok) {
        setClients(await cliRes.value.json());
      }
    } catch (err) {
      console.error("Erro ao carregar auditoria de lucro oculto:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatBRL = (val: number) => {
    const safe =
      typeof val === "number" && !isNaN(val) && isFinite(val) ? val : 0;
    try {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(safe);
    } catch {
      return `R$ ${safe.toFixed(2)}`;
    }
  };

  const analysis = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : [];

    const totalRevenue = list
      .filter((t) => String(t?.type || "").toLowerCase() === "income")
      .reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);

    const totalExpense = list
      .filter((t) => String(t?.type || "").toLowerCase() === "expense")
      .reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);

    const currentCash = totalRevenue - totalExpense;

    const opportunities: WasteOpportunity[] = [];

    const bankFees = list
      .filter(
        (t) =>
          String(t?.type || "").toLowerCase() === "expense" &&
          (String(t?.description || "")
            .toLowerCase()
            .includes("taxa") ||
            String(t?.description || "")
              .toLowerCase()
              .includes("tarifa") ||
            String(t?.description || "")
              .toLowerCase()
              .includes("banco") ||
            String(t?.description || "")
              .toLowerCase()
              .includes("ted") ||
            String(t?.description || "")
              .toLowerCase()
              .includes("pix")),
      )
      .reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);

    if (bankFees > 0) {
      const estimatedFeeWaste = bankFees * 0.7;
      opportunities.push({
        id: "bank_fees_opp",
        category: "bank_fees",
        title: "Tarifas de Manutenção de Conta e Emissão de Boletos",
        description: `Identificamos ${formatBRL(bankFees)} em tarifas bancárias correntes que podem ser reduzidas com contas corporativas sem tarifa ou negociação de pacote PJ.`,
        monthlyImpact: estimatedFeeWaste,
        annualSavings: estimatedFeeWaste * 12,
        recommendedAction:
          "Solicitar isenção de tarifa de pacote PJ ou migrar emissão para Pix Cobrança.",
        negotiationTemplate: `Prezado gerente PJ, solicitamos a revisão e isenção das tarifas de manutenção da conta corrente empresarial da nossa empresa, tendo em vista o volume transacionado e as ofertas de mercado com taxa zero. Caso não seja possível a isenção integral, solicitamos o cancelamento do pacote de serviços atual.`,
      });
    }

    const softwareExpenses = list
      .filter(
        (t) =>
          String(t?.type || "").toLowerCase() === "expense" &&
          (String(t?.sector_name || "")
            .toLowerCase()
            .includes("ti") ||
            String(t?.sector_name || "")
              .toLowerCase()
              .includes("software") ||
            String(t?.description || "")
              .toLowerCase()
              .includes("software") ||
            String(t?.description || "")
              .toLowerCase()
              .includes("licenca") ||
            String(t?.description || "")
              .toLowerCase()
              .includes("cloud") ||
            String(t?.description || "")
              .toLowerCase()
              .includes("aws") ||
            String(t?.description || "")
              .toLowerCase()
              .includes("google")),
      )
      .reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);

    const subscriptionWaste =
      softwareExpenses > 0 ? softwareExpenses * 0.2 : totalExpense * 0.04;
    opportunities.push({
      id: "software_opp",
      category: "subscription_leak",
      title: "Otimização de Licenças de SaaS & Serviços em Nuvem",
      description: `Com base nas despesas recorrentes, estima-se que 15% a 20% das licenças de software corporativas estejam ociosas ou em planos acima do consumo real.`,
      monthlyImpact: subscriptionWaste,
      annualSavings: subscriptionWaste * 12,
      recommendedAction:
        "Auditar licenças não utilizadas e negociar contratos em formato anual com desconto.",
      negotiationTemplate: `Prezada equipe comercial, estamos auditando nossas ferramentas corporativas e gostaríamos de negociar um desconto para migração ao plano anual ou consolidação de licenças, visando manter a parceria para o próximo exercício.`,
    });

    const topSupplierOpportunity = totalExpense * 0.05;
    opportunities.push({
      id: "supplier_opp",
      category: "supplier_increase",
      title: "Repactuação nos 3 Maiores Fornecedores Operacionais",
      description: `Ao aplicar uma repactuação de apenas 5% nos principais contratos de prestação de serviços ou matéria-prima, sua empresa recupera margem sem impacto na entrega.`,
      monthlyImpact: topSupplierOpportunity,
      annualSavings: topSupplierOpportunity * 12,
      recommendedAction:
        "Abrir rodada de alinhamento semestral com fornecedores estratégicos.",
      negotiationTemplate: `Prezado parceiro, diante do nosso histórico de pontualidade e volume de pedidos, gostaríamos de solicitar uma repactuação de 5% no valor dos serviços para o próximo trimestre, assegurando nossa fidelidade de longo prazo.`,
    });

    const totalAnnualRecoverable = opportunities.reduce(
      (sum, op) => sum + op.annualSavings,
      0,
    );

    const safetyBuffer = totalExpense > 0 ? totalExpense * 0.4 : 10000;
    const idleCash = Math.max(0, currentCash - safetyBuffer);
    const annualCdiRate = 0.105;
    const monthlyYield = (idleCash * annualCdiRate) / 12;
    const annualYield = idleCash * annualCdiRate;

    const priceBoostRate = 0.045;
    const additionalMonthlyRevenue = totalRevenue * priceBoostRate;
    const additionalAnnualProfit = additionalMonthlyRevenue * 12;

    return {
      totalRevenue,
      totalExpense,
      currentCash,
      opportunities,
      totalAnnualRecoverable,
      safetyBuffer,
      idleCash,
      monthlyYield,
      annualYield,
      additionalMonthlyRevenue,
      additionalAnnualProfit,
    };
  }, [transactions]);

  const copyTemplate = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Banner Principal com Fundo Escuro Blindado */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <Sparkles size={14} className="text-emerald-400 animate-pulse" />
              Auditoria de Lucro Oculto & Piloto de Tesouraria
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
              Identificamos até{" "}
              <span className="text-emerald-400 font-mono font-extrabold">
                {formatBRL(
                  analysis.totalAnnualRecoverable +
                    analysis.annualYield +
                    analysis.additionalAnnualProfit,
                )}
              </span>{" "}
              em potencial de lucro novo na sua operação.
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed">
              Otimizações de desperdício em contratos, rendimento de capital
              ocioso e alavancagem de preços calculados sobre sua base contábil.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Atualizar Auditoria Contábil
            </button>
          </div>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("waste")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === "waste"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Flame size={14} className="text-rose-400" />
          Ralos Invisíveis & Desperdícios ({analysis.opportunities.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("treasury")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === "treasury"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Wallet size={14} className="text-emerald-400" />
          Piloto de Caixa Ocioso (Smart Sweeper)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pricing")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === "pricing"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Percent size={14} className="text-purple-400" />
          Margem Turbo nos Contratos (+4.5%)
        </button>
      </div>

      {/* ABA 1: RALOS INVISÍVEIS */}
      {activeTab === "waste" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium block">
                Economia Anual Estimada
              </span>
              <p className="text-xl font-bold font-mono text-emerald-600 mt-1">
                {formatBRL(analysis.totalAnnualRecoverable)}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Direto para o EBITDA
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium block">
                Impacto Mensal de Desperdício
              </span>
              <p className="text-xl font-bold font-mono text-rose-600 mt-1">
                {formatBRL(analysis.totalAnnualRecoverable / 12)}/mês
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Vazamento em contratos e tarifas
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium block">
                Ações Imediatas
              </span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">
                {analysis.opportunities.length} Contratos
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Com modelos de negociação prontos
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {analysis.opportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <AlertTriangle
                        size={15}
                        className="text-amber-500 shrink-0"
                      />
                      {opp.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      {opp.description}
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Recuperação Estimada
                    </span>
                    <strong className="text-sm font-mono font-bold text-emerald-600">
                      +{formatBRL(opp.annualSavings)}/ano
                    </strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <Zap size={13} className="text-emerald-600" />
                      Modelo de Comunicação / E-mail de Renegociação:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyTemplate(opp.negotiationTemplate, opp.id)
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-semibold transition cursor-pointer"
                    >
                      {copiedId === opp.id ? (
                        <>
                          <Check size={12} className="text-emerald-400" />{" "}
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copiar Mensagem
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 font-mono bg-white p-2.5 rounded border border-slate-200 leading-relaxed">
                    "{opp.negotiationTemplate}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 2: PILOTO DE CAIXA OCIOSO */}
      {activeTab === "treasury" && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Wallet size={16} className="text-emerald-600" />
              Piloto Automático de Tesouraria (Sweeper de Rendimento 100% CDI)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Não deixe dinheiro parado na conta corrente sem rendimento por
              medo de fluxo de caixa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Saldo Atual em Conta
              </span>
              <strong className="text-lg font-mono text-slate-900">
                {formatBRL(analysis.currentCash)}
              </strong>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Posição consolidada hoje
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Colchão de Segurança Recomendado
              </span>
              <strong className="text-lg font-mono text-amber-600">
                {formatBRL(analysis.safetyBuffer)}
              </strong>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Para cobrir despesas imediatas
              </span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-semibold text-emerald-700 block">
                Capital Ocioso para Aplicação
              </span>
              <strong className="text-lg font-mono text-emerald-700">
                {formatBRL(analysis.idleCash)}
              </strong>
              <span className="text-[10px] text-emerald-600 mt-1 block">
                Livre para liquidez diária
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles size={14} /> Rendimento Passivo Projetado (100% CDI):
              </span>
              <p className="text-xs text-slate-300">
                Alocando os <strong>{formatBRL(analysis.idleCash)}</strong> em
                CDB de Liquidez Diária com resgate imediato:
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-xl font-bold font-mono text-emerald-400">
                +{formatBRL(analysis.monthlyYield)}/mês
              </span>
              <span className="text-[10px] text-slate-400 block">
                (~{formatBRL(analysis.annualYield)}/ano sem risco operacional)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: MARGEM TURBO */}
      {activeTab === "pricing" && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Percent size={16} className="text-purple-600" />
              Simulador de Elasticidade de Preço & Margem Turbo
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Impacto no lucro líquido anual aplicando reajuste inflacionário
              moderado (+4.5%) nos contratos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <span className="text-[10px] uppercase font-semibold text-purple-700 block">
                Acréscimo de Faturamento Mensal
              </span>
              <p className="text-xl font-bold font-mono text-purple-800 mt-1">
                +{formatBRL(analysis.additionalMonthlyRevenue)}/mês
              </p>
              <span className="text-[10px] text-purple-600 mt-1 block">
                Com base na receita bruta atual de{" "}
                {formatBRL(analysis.totalRevenue)}
              </span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-semibold text-emerald-700 block">
                Lucro Líquido Anual Adicional Retido
              </span>
              <p className="text-xl font-bold font-mono text-emerald-700 mt-1">
                +{formatBRL(analysis.additionalAnnualProfit)}/ano
              </p>
              <span className="text-[10px] text-emerald-600 mt-1 block">
                100% convertido diretamente em lucro líquido
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Modelo de Comunicado Amigável de Reajuste Inflacionário para
                Clientes:
              </span>
              <button
                type="button"
                onClick={() =>
                  copyTemplate(
                    `Prezada equipe, informamos a atualização anual de 4,5% referente ao alinhamento inflacionário nos contratos de prestação de serviços a partir do próximo ciclo. Permanecemos à disposição para manter a excelência em nossas entregas.`,
                    "client_price_template",
                  )
                }
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-semibold transition cursor-pointer"
              >
                {copiedId === "client_price_template" ? (
                  <>
                    <Check size={12} className="text-emerald-400" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy size={12} /> Copiar Comunicado
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-600 font-mono bg-white p-3 rounded border border-slate-200 leading-relaxed">
              "Prezada equipe, informamos a atualização anual de 4,5% referente
              ao alinhamento inflacionário nos contratos de prestação de
              serviços a partir do próximo ciclo. Permanecemos à disposição para
              manter a excelência em nossas entregas."
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitRecoveryEngine;
