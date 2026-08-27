import React, { useState, useMemo } from "react";
import { Sliders, Zap } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface SimulatorProps {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

export const FinancialHealthAndSimulator: React.FC<SimulatorProps> = ({
  currentBalance,
  monthlyIncome,
  monthlyExpense,
}) => {
  const [revenueChange, setRevenueChange] = useState<number>(0);
  const [extraExpenses, setExtraExpenses] = useState<number>(0);
  const [simulatedMonths, setSimulatedMonths] = useState<number>(6);

  const healthScore = useMemo(() => {
    let score = 50;
    if (monthlyIncome > monthlyExpense * 1.5) score += 30;
    else if (monthlyIncome > monthlyExpense) score += 15;
    else score -= 25;

    if (currentBalance > monthlyExpense * 3) score += 20;
    else if (currentBalance > monthlyExpense) score += 10;
    else score -= 20;

    return Math.min(Math.max(score, 5), 99);
  }, [currentBalance, monthlyIncome, monthlyExpense]);

  const projectionData = useMemo(() => {
    const data = [];
    const simulatedMonthlyNet =
      monthlyIncome * (1 + revenueChange / 100) -
      (monthlyExpense + extraExpenses);

    let runningBalance = currentBalance;

    for (let i = 0; i <= simulatedMonths; i++) {
      data.push({
        month: i === 0 ? "Hoje" : `Mês +${i}`,
        saldoProjetado: Math.round(runningBalance),
      });
      runningBalance += simulatedMonthlyNet;
    }
    return data;
  }, [
    currentBalance,
    monthlyIncome,
    monthlyExpense,
    revenueChange,
    extraExpenses,
    simulatedMonths,
  ]);

  const simulatedBurnRate =
    monthlyExpense + extraExpenses - monthlyIncome * (1 + revenueChange / 100);
  const runwayMonths =
    simulatedBurnRate > 0
      ? (currentBalance / simulatedBurnRate).toFixed(1)
      : "Superavitário";

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center h-14 w-14 rounded-xl bg-slate-800 border border-slate-700 font-mono text-2xl font-bold text-emerald-400">
            {healthScore}
            <span className="text-[9px] text-slate-400 block absolute -bottom-1 tracking-wider">
              SCORE
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight">
                Índice de Solvência & Saúde Financeira
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  healthScore >= 70
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {healthScore >= 70
                  ? "Grau A: Saudável"
                  : "Grau B: Atenção à Liquidez"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Runway operacional estimado:{" "}
              <strong className="text-white">
                {runwayMonths} {runwayMonths === "Superavitário" ? "" : "meses"}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
          <Zap size={13} className="text-amber-400" />
          <span>Motor de Stress Testing Ativo</span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sliders size={15} className="text-slate-700" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Simulação de Cenários (What-If)
            </h4>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Oscilação de Receita</span>
              <strong
                className={
                  revenueChange >= 0 ? "text-emerald-600" : "text-rose-600"
                }
              >
                {revenueChange > 0 ? `+${revenueChange}%` : `${revenueChange}%`}
              </strong>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="5"
              value={revenueChange}
              onChange={(e) => setRevenueChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Novas Despesas Fixas / Mês</span>
              <strong className="text-slate-900">
                {formatBRL(extraExpenses)}
              </strong>
            </div>
            <input
              type="range"
              min="0"
              max="30000"
              step="1000"
              value={extraExpenses}
              onChange={(e) => setExtraExpenses(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Horizonte de Projeção</span>
              <strong className="text-slate-900">
                {simulatedMonths} meses
              </strong>
            </div>
            <div className="flex gap-2">
              {[3, 6, 12].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSimulatedMonths(m)}
                  className={`flex-1 py-1 text-xs font-semibold rounded-md border transition ${
                    simulatedMonths === m
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {m}M
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-700">
              Trajetória do Saldo em Caixa (Projetado)
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Saldo Final:{" "}
              <strong className="text-slate-900">
                {formatBRL(
                  projectionData[projectionData.length - 1]?.saldoProjetado ||
                    0,
                )}
              </strong>
            </span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={projectionData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="gradientProjetado"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="2 2"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `R$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "11px",
                    border: "none",
                  }}
                  formatter={(v: number) => [formatBRL(v), "Saldo Previsto"]}
                />
                <Area
                  type="monotone"
                  dataKey="saldoProjetado"
                  stroke="#0f172a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradientProjetado)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialHealthAndSimulator;
