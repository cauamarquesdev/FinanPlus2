import React, { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  Percent,
  Target,
  Scale,
  Award,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Transaction, Client } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "";

export const ProfitAnalytics: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [targetProfitInput, setTargetProfitInput] = useState<string>("30000");

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  const loadData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const [txRes, cliRes] = await Promise.allSettled([
        fetch(`${API_URL}/transactions`, { headers }),
        fetch(`${API_URL}/clients`, { headers }),
      ]);

      if (txRes.status === "fulfilled" && txRes.value.ok) {
        const txData = await txRes.value.json();
        setTransactions(Array.isArray(txData) ? txData : []);
      }
      if (cliRes.status === "fulfilled" && cliRes.value.ok) {
        const cliData = await cliRes.value.json();
        setClients(Array.isArray(cliData) ? cliData : []);
      }
    } catch (err) {
      console.error("Erro ao carregar dados de lucratividade:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatBRL = (val: number) => {
    const safeVal =
      typeof val === "number" && !isNaN(val) && isFinite(val) ? val : 0;
    try {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(safeVal);
    } catch {
      return `R$ ${safeVal.toFixed(2)}`;
    }
  };

  const metrics = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : [];

    const totalRevenue = list
      .filter((t) => String(t?.type || "").toLowerCase() === "income")
      .reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);

    let directCosts = 0;
    let operationalExpenses = 0;
    let taxesAndFees = 0;

    list
      .filter((t) => String(t?.type || "").toLowerCase() === "expense")
      .forEach((t) => {
        const desc = String(t?.description || "").toLowerCase();
        const sector = String(t?.sector_name || "").toLowerCase();
        const amt = Number(t?.amount) || 0;

        if (
          desc.includes("imposto") ||
          desc.includes("darf") ||
          desc.includes("taxa") ||
          sector.includes("tribut")
        ) {
          taxesAndFees += amt;
        } else if (
          sector.includes("producao") ||
          sector.includes("servico") ||
          desc.includes("fornecedor")
        ) {
          directCosts += amt;
        } else {
          operationalExpenses += amt;
        }
      });

    if (directCosts === 0 && operationalExpenses > 0) {
      directCosts = operationalExpenses * 0.25;
      operationalExpenses = operationalExpenses * 0.75;
    }

    const grossProfit = totalRevenue - directCosts;
    const grossMargin =
      totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const ebitda = grossProfit - operationalExpenses;
    const ebitdaMargin = totalRevenue > 0 ? (ebitda / totalRevenue) * 100 : 0;

    const netProfit = ebitda - taxesAndFees;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const fixedCosts = operationalExpenses + directCosts + taxesAndFees;
    const breakEvenPoint = fixedCosts > 0 ? fixedCosts : 0;
    const breakEvenProgress =
      breakEvenPoint > 0
        ? Math.min(100, Math.max(0, (totalRevenue / breakEvenPoint) * 100))
        : 100;

    const clientProfitMap: Record<
      string,
      { revenue: number; transactions: number; clientName: string }
    > = {};

    list
      .filter((t) => String(t?.type || "").toLowerCase() === "income")
      .forEach((t) => {
        const name = t?.client_name || "Cliente Avulso";
        if (!clientProfitMap[name]) {
          clientProfitMap[name] = {
            revenue: 0,
            transactions: 0,
            clientName: name,
          };
        }
        clientProfitMap[name].revenue += Number(t?.amount) || 0;
        clientProfitMap[name].transactions += 1;
      });

    const clientRankings = Object.values(clientProfitMap)
      .map((c) => {
        const estimatedMargin =
          totalRevenue > 0 ? (c.revenue / totalRevenue) * netProfit : 0;
        const marginPercent =
          c.revenue > 0 ? (estimatedMargin / c.revenue) * 100 : netMargin;
        return {
          ...c,
          estimatedProfit: estimatedMargin,
          marginPercent: isNaN(marginPercent) ? 0 : marginPercent,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    const waterfallData = [
      {
        step: "Receita Bruta",
        valor: Math.max(0, totalRevenue),
        color: "#10b981",
      },
      {
        step: "(-) Custos Diretos",
        valor: Math.max(0, directCosts),
        color: "#f43f5e",
      },
      {
        step: "Lucro Bruto",
        valor: Math.max(0, grossProfit),
        color: "#0ea5e9",
      },
      {
        step: "(-) OPEX / Geral",
        valor: Math.max(0, operationalExpenses),
        color: "#f43f5e",
      },
      { step: "EBITDA", valor: Math.max(0, ebitda), color: "#8b5cf6" },
      {
        step: "(-) Tributos",
        valor: Math.max(0, taxesAndFees),
        color: "#f43f5e",
      },
      {
        step: "Lucro Líquido",
        valor: Math.abs(netProfit),
        color: netProfit >= 0 ? "#059669" : "#e11d48",
      },
    ];

    return {
      totalRevenue,
      directCosts,
      grossProfit,
      grossMargin: isNaN(grossMargin) ? 0 : grossMargin,
      operationalExpenses,
      ebitda,
      ebitdaMargin: isNaN(ebitdaMargin) ? 0 : ebitdaMargin,
      taxesAndFees,
      netProfit,
      netMargin: isNaN(netMargin) ? 0 : netMargin,
      fixedCosts,
      breakEvenPoint,
      breakEvenProgress: isNaN(breakEvenProgress) ? 0 : breakEvenProgress,
      clientRankings,
      waterfallData,
    };
  }, [transactions]);

  const targetCalculations = useMemo(() => {
    const targetProfit = parseFloat(targetProfitInput) || 0;
    const currentNet = metrics.netProfit;
    const gap = targetProfit - currentNet;
    const requiredRevenue =
      targetProfit > 0 ? metrics.fixedCosts + targetProfit : 0;
    const revenueToGrow = Math.max(0, requiredRevenue - metrics.totalRevenue);
    const costReductionNeeded = Math.max(0, gap);

    return {
      targetProfit,
      gap,
      requiredRevenue,
      revenueToGrow,
      costReductionNeeded,
      isAchieved: gap <= 0,
    };
  }, [targetProfitInput, metrics]);

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Award size={16} className="text-emerald-600" />
            Análise Avançada de Lucratividade, Margens & EBITDA
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Decomposição de margens, Ponto de Equilíbrio (Break-even), EBITDA e
            Simulador de Metas
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

      {/* Cards KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Lucro Bruto</span>
            <span className="font-mono text-emerald-600 font-bold">
              {metrics.grossMargin.toFixed(1)}% Margem
            </span>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {formatBRL(metrics.grossProfit)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Receita (-) Custos Diretos
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>EBITDA Operacional</span>
            <span className="font-mono text-purple-600 font-bold">
              {metrics.ebitdaMargin.toFixed(1)}% Margem
            </span>
          </div>
          <p className="text-xl font-bold font-mono text-purple-700 mt-1">
            {formatBRL(metrics.ebitda)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Geração de caixa pura do negócio
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Lucro Líquido Real</span>
            <span
              className={`font-mono font-bold ${
                metrics.netMargin >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {metrics.netMargin.toFixed(1)}% Margem
            </span>
          </div>
          <p
            className={`text-xl font-bold font-mono mt-1 ${
              metrics.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {formatBRL(metrics.netProfit)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Após dedução de tributos e taxas
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">
            Eficiência de Conversão
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            {metrics.netMargin >= 20 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck size={13} /> Alta Rentabilidade
              </span>
            ) : metrics.netMargin > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Percent size={13} /> Margem Moderada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertTriangle size={13} /> Operação em Déficit
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Retenção de lucro por receita
          </span>
        </div>
      </div>

      {/* Break-even e Target Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-slate-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Termômetro de Ponto de Equilíbrio (Break-Even)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700">
              {metrics.breakEvenProgress.toFixed(0)}% Coberto
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Faturamento mínimo necessário para cobrir todos os custos
            operacionais:
          </p>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Ponto de Equilíbrio
              </span>
              <strong className="text-lg font-mono text-slate-900">
                {formatBRL(metrics.breakEvenPoint)}
              </strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Faturado Atual
              </span>
              <strong className="text-lg font-mono text-emerald-600">
                {formatBRL(metrics.totalRevenue)}
              </strong>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  metrics.breakEvenProgress >= 100
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                }`}
                style={{ width: `${metrics.breakEvenProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>R$ 0,00</span>
              <span>Break-even: {formatBRL(metrics.breakEvenPoint)}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-lg text-xs text-emerald-800">
            {metrics.totalRevenue >= metrics.breakEvenPoint ? (
              <p className="flex items-center gap-1.5 font-medium">
                <Sparkles size={14} className="text-emerald-600 shrink-0" />
                Meta de cobertura atingida! A operação já gera lucro livre.
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-amber-800 font-medium">
                <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                Faltam{" "}
                <strong>
                  {formatBRL(metrics.breakEvenPoint - metrics.totalRevenue)}
                </strong>{" "}
                para atingir o ponto de equilíbrio.
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-6 bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Simulador de Meta de Lucro (Target Profit Engine)
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-medium text-slate-300">
              Quanto de Lucro Líquido Real você deseja alcançar? (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-mono font-bold text-slate-400">
                R$
              </span>
              <input
                type="number"
                value={targetProfitInput}
                onChange={(e) => setTargetProfitInput(e.target.value)}
                className="w-full text-sm font-mono font-bold pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Receita Necessária
              </span>
              <p className="text-sm font-mono font-bold text-emerald-400">
                {formatBRL(targetCalculations.requiredRevenue)}
              </p>
              <span className="text-[10px] text-slate-400 block">
                (+{formatBRL(targetCalculations.revenueToGrow)} em vendas)
              </span>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Ou Corte de Custos
              </span>
              <p className="text-sm font-mono font-bold text-amber-400">
                {formatBRL(targetCalculations.costReductionNeeded)}
              </p>
              <span className="text-[10px] text-slate-400 block">
                em despesas operacionais
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
            {targetCalculations.isAchieved ? (
              <span className="text-emerald-400 font-semibold">
                O lucro líquido atual de {formatBRL(metrics.netProfit)} já
                atende à meta estipulada.
              </span>
            ) : (
              <span>
                Para atingir{" "}
                <strong>{formatBRL(targetCalculations.targetProfit)}</strong>,
                aumente o faturamento em{" "}
                <strong className="text-emerald-300">
                  {formatBRL(targetCalculations.revenueToGrow)}
                </strong>{" "}
                ou reduza despesas em{" "}
                <strong className="text-amber-300">
                  {formatBRL(targetCalculations.costReductionNeeded)}
                </strong>
                .
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico com Container Estabilizado */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Cascata de Lucratividade Contábil (Formação do Lucro)
          </h3>
          <p className="text-xs text-slate-500">
            Decomposição da receita bruta até o lucro líquido retido
          </p>
        </div>

        <div className="w-full h-72 min-h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={metrics.waterfallData}
              margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="step"
                tick={{ fontSize: 10, fill: "#475569" }}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(v) => `R$ ${(Number(v) / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(val: any) => [formatBRL(Number(val) || 0), "Valor"]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                {metrics.waterfallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de Rentabilidade */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Users size={15} className="text-slate-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Rentabilidade e Margem Líquida por Cliente
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="px-4 py-3">Cliente / Tomador</th>
                <th className="px-4 py-3 text-center">Faturas</th>
                <th className="px-4 py-3 text-right">Faturamento Total</th>
                <th className="px-4 py-3 text-right">Lucro Estimado</th>
                <th className="px-4 py-3 text-center">Classificação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.clientRankings.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-6 text-slate-400 text-xs"
                  >
                    Nenhum faturamento por cliente registrado.
                  </td>
                </tr>
              ) : (
                metrics.clientRankings.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {c.clientName}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-500">
                      {c.transactions}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {formatBRL(c.revenue)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">
                      {formatBRL(c.estimatedProfit)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.revenue >= metrics.totalRevenue * 0.25 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Conta Estratégica (High LTV)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          Rentabilidade Padrão
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfitAnalytics;
