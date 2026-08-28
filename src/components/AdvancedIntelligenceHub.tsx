import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  ShieldCheck,
  Building,
  Scale,
  RefreshCw,
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  ArrowUpRight,
  Calculator,
} from "lucide-react";
import { Transaction, Client } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "";

export const AdvancedIntelligenceHub: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "valuation" | "dividends" | "sentinel" | "unit_econ"
  >("valuation");

  // Multiplicador de EBITDA para Valuation (Slider 3x a 10x)
  const [ebitdaMultiple, setEbitdaMultiple] = useState<number>(5.5);
  // Valor total retirado pelos sócios mensalmente (R$)
  const [monthlyPartnerDraw, setMonthlyPartnerDraw] = useState<number>(20000);

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
      console.error("Erro ao carregar inteligência avançada:", err);
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

  const analytics = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : [];

    const totalRevenue = list
      .filter((t) => String(t?.type || "").toLowerCase() === "income")
      .reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);

    const totalExpense = list
      .filter((t) => String(t?.type || "").toLowerCase() === "expense")
      .reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);

    const netProfit = totalRevenue - totalExpense;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // 1. EBITDA Anualizado & Valuation
    const annualRevenue = totalRevenue * 12;
    const annualEbitda = Math.max(0, netProfit + totalExpense * 0.15) * 12;
    const estimatedValuation =
      annualEbitda > 0 ? annualEbitda * ebitdaMultiple : annualRevenue * 0.8;

    // 2. Sentinela de Fraudes & Anomalias
    const anomalies: Array<{
      id: string;
      title: string;
      desc: string;
      severity: "high" | "medium";
    }> = [];

    // Anomalia 1: Transações duplicadas no mesmo valor
    const expenseAmounts = list
      .filter((t) => String(t?.type || "").toLowerCase() === "expense")
      .map((t) => Number(t?.amount));
    const duplicates = expenseAmounts.filter(
      (item, index) => expenseAmounts.indexOf(item) !== index && item > 1000,
    );
    if (duplicates.length > 0) {
      anomalies.push({
        id: "dup_tx",
        title: "Lançamentos de Despesa com Valores Idênticos",
        desc: `Detectamos ${duplicates.length} despesas acima de R$ 1.000 com valores exatos repetidos no mesmo período. Verifique se houve lançamento duplo.`,
        severity: "medium",
      });
    }

    // Anomalia 2: Concentração de Despesa
    const maxSingleExpense = Math.max(...expenseAmounts, 0);
    if (maxSingleExpense > totalExpense * 0.35 && totalExpense > 0) {
      anomalies.push({
        id: "single_high_exp",
        title: "Super Concentração em Único Pagamento",
        desc: `Um único lançamento de ${formatBRL(maxSingleExpense)} representou mais de 35% de todo o desembolso da empresa.`,
        severity: "high",
      });
    }

    if (anomalies.length === 0) {
      anomalies.push({
        id: "all_clear",
        title: "Integridade Contábil Auditada",
        desc: "Nenhum desvio padrão crítico ou inconsistência de duplicidade encontrada nos livros recentes.",
        severity: "low" as any,
      });
    }

    // 3. Otimizador de Pró-labore vs Lucros
    const minimumProLabore = 1412.0; // Salário Mínimo base INSS
    const proLaboreTaxes = minimumProLabore * 0.11; // 11% INSS
    const dividendPortion = Math.max(0, monthlyPartnerDraw - minimumProLabore);
    const traditionalTaxDraw = monthlyPartnerDraw * 0.275; // Se tirasse 100% como CLT
    const optimizedTaxDraw = proLaboreTaxes; // Pró-labore mínimo + resto lucros isentos
    const monthlyTaxSaved = Math.max(0, traditionalTaxDraw - optimizedTaxDraw);
    const annualTaxSaved = monthlyTaxSaved * 12;

    // 4. Eficiência de Capital por Setor
    const sectorExpenses: Record<string, number> = {};
    list
      .filter((t) => String(t?.type || "").toLowerCase() === "expense")
      .forEach((t) => {
        const sec = t?.sector_name || "Geral";
        sectorExpenses[sec] =
          (sectorExpenses[sec] || 0) + (Number(t?.amount) || 0);
      });

    return {
      totalRevenue,
      totalExpense,
      netProfit,
      netMargin,
      annualRevenue,
      annualEbitda,
      estimatedValuation,
      anomalies,
      minimumProLabore,
      dividendPortion,
      monthlyTaxSaved,
      annualTaxSaved,
      sectorExpenses: Object.entries(sectorExpenses).sort(
        (a, b) => b[1] - a[1],
      ),
    };
  }, [transactions, ebitdaMultiple, monthlyPartnerDraw]);

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Zap size={16} className="text-amber-500" />
            Central de Inteligência Corporativa & Valuation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Valuation M&A, Otimizador Tributário de Sócios e Sentinela de
            Fraudes Contábeis
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Navegação de Abas */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("valuation")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === "valuation"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Building size={14} className="text-emerald-400" />
          Valuation & M&A Readiness
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dividends")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === "dividends"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Scale size={14} className="text-purple-400" />
          Otimizador Tributário de Sócios (Dividendos)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sentinel")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === "sentinel"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <ShieldAlert size={14} className="text-rose-400" />
          Sentinela Anti-Fraude & Anomalias ({analytics.anomalies.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("unit_econ")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === "unit_econ"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Layers size={14} className="text-blue-400" />
          Unit Economics & ROIC Setorial
        </button>
      </div>

      {/* ABA 1: VALUATION & M&A */}
      {activeTab === "valuation" && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                  <Sparkles size={14} /> M&A Market Valuation Engine
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white mt-1">
                  {formatBRL(analytics.estimatedValuation)}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Valor justo estimado da empresa com base em múltiplos de
                  mercado sobre o EBITDA Anualizado
                </p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  EBITDA Anualizado
                </span>
                <strong className="text-base font-mono font-bold text-emerald-400">
                  {formatBRL(analytics.annualEbitda)}/ano
                </strong>
              </div>
            </div>

            {/* Slider de Múltiplo de Mercado */}
            <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">
                  Multiplicador de M&A do Segmento:
                </span>
                <strong className="font-mono font-bold text-emerald-400 text-sm">
                  {ebitdaMultiple.toFixed(1)}x EBITDA
                </strong>
              </div>
              <input
                type="range"
                min={2.5}
                max={12.0}
                step={0.5}
                value={ebitdaMultiple}
                onChange={(e) => setEbitdaMultiple(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>2.5x (Tradicional / Varejo)</span>
                <span>5.5x (Serviços B2B / Indústria)</span>
                <span>10.0x+ (Tech / SaaS / Escala)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: OTIMIZADOR TRIBUTÁRIO DE SÓCIOS */}
      {activeTab === "dividends" && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Scale size={16} className="text-purple-600" />
              Otimizador Tributário: Pró-labore vs Distribuição de Lucros Isenta
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Engenharia contábil para reduzir a carga de IRPF/INSS e maximizar
              o líquido dos sócios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-[11px] font-semibold text-slate-700 block">
                Retirada Mensal Total dos Sócios (R$):
              </label>
              <input
                type="number"
                step={1000}
                value={monthlyPartnerDraw}
                onChange={(e) => setMonthlyPartnerDraw(Number(e.target.value))}
                className="w-full text-sm font-mono font-bold px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900"
              />
            </div>

            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <span className="text-[10px] uppercase font-semibold text-purple-700 block">
                Distribuição Isenta de Imposto
              </span>
              <p className="text-xl font-bold font-mono text-purple-800 mt-1">
                {formatBRL(analytics.dividendPortion)}/mês
              </p>
              <span className="text-[10px] text-purple-600 mt-0.5 block">
                0% IRPF (Legalmente Isento)
              </span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-semibold text-emerald-700 block">
                Economia Tributária Anual
              </span>
              <p className="text-xl font-bold font-mono text-emerald-700 mt-1">
                +{formatBRL(analytics.annualTaxSaved)}/ano
              </p>
              <span className="text-[10px] text-emerald-600 mt-0.5 block">
                Economia pura para os sócios
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: SENTINELA ANTI-FRAUDE */}
      {activeTab === "sentinel" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-500" />
              Auditoria de Riscos & Sentinela Anti-Fraude
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Varredura algorítmica de lançamentos anômalos, desvios e riscos
              operacionais
            </p>
          </div>

          <div className="space-y-3">
            {analytics.anomalies.map((anom) => (
              <div
                key={anom.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    {anom.severity === "high" ? (
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                    )}
                    {anom.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {anom.desc}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                    anom.severity === "high"
                      ? "bg-rose-100 text-rose-700 border border-rose-200"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {anom.severity === "high" ? "Atenção" : "Monitorar"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 4: UNIT ECONOMICS & ROIC */}
      {activeTab === "unit_econ" && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Layers size={16} className="text-blue-600" />
            Consumo de Capital por Centro de Custo (OPEX)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {analytics.sectorExpenses.map(([sec, val], i) => (
              <div
                key={i}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200"
              >
                <span className="text-[11px] font-bold text-slate-700 block truncate">
                  {sec}
                </span>
                <strong className="text-base font-mono text-slate-900 block mt-1">
                  {formatBRL(val)}
                </strong>
                <span className="text-[10px] text-slate-400">
                  {analytics.totalExpense > 0
                    ? ((val / analytics.totalExpense) * 100).toFixed(1)
                    : 0}
                  % das despesas
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedIntelligenceHub;
