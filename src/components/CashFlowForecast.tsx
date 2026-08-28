import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Sliders,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  Zap,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import { Transaction } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "";

export const CashFlowForecast: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Variáveis Interativas de Simulação de Cenários (Sliders)
  const [revenueDelta, setRevenueDelta] = useState<number>(0); // % de variação (-50% a +50%)
  const [expenseDelta, setExpenseDelta] = useState<number>(0); // % de variação (-50% a +50%)
  const [extraOneTimeCost, setExtraOneTimeCost] = useState<number>(0); // Desembolso pontual (R$)
  const [forecastHorizon, setForecastHorizon] = useState<30 | 60 | 90>(60); // Dias

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

      const res = await fetch(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Erro ao carregar dados para Forecast:", err);
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

  // Motor Estatístico Preditivo de Fluxo de Caixa
  const forecastMetrics = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : [];

    const totalIn = list
      .filter((t) => String(t?.type || "").toLowerCase() === "income")
      .reduce((acc, t) => acc + (Number(t?.amount) || 0), 0);

    const totalOut = list
      .filter((t) => String(t?.type || "").toLowerCase() === "expense")
      .reduce((acc, t) => acc + (Number(t?.amount) || 0), 0);

    const currentCash = totalIn - totalOut;

    // Estimativa de base diária (média de 30 dias operacionais)
    const dailyIncomeBase = totalIn > 0 ? totalIn / 30 : 1500;
    const dailyExpenseBase = totalOut > 0 ? totalOut / 30 : 900;

    // Multiplicadores do cenário em teste
    const simulatedDailyIncome = dailyIncomeBase * (1 + revenueDelta / 100);
    const simulatedDailyExpense = dailyExpenseBase * (1 + expenseDelta / 100);
    const simulatedDailyNet = simulatedDailyIncome - simulatedDailyExpense;

    // Cálculo do Runway em dias
    let runwayDays = 999;
    if (simulatedDailyNet < 0) {
      const burnRate = Math.abs(simulatedDailyNet);
      const effectiveCash = Math.max(0, currentCash - extraOneTimeCost);
      runwayDays = burnRate > 0 ? Math.floor(effectiveCash / burnRate) : 999;
    }

    // Geração da curva temporal
    const chartData = [];
    const today = new Date();
    let accumulatedCash = currentCash - extraOneTimeCost;
    const step = forecastHorizon === 30 ? 3 : forecastHorizon === 60 ? 5 : 7;

    for (let day = 0; day <= forecastHorizon; day += step) {
      const projectionDate = new Date(today);
      projectionDate.setDate(today.getDate() + day);

      const label = day === 0 ? "Hoje" : `D+${day}`;

      if (day > 0) {
        accumulatedCash += simulatedDailyNet * step;
      }

      chartData.push({
        day: label,
        dataCompleta: projectionDate.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        }),
        saldoProjetado: Math.round(accumulatedCash),
        receitaAcumulada: Math.round(simulatedDailyIncome * day),
        despesaAcumulada: Math.round(
          simulatedDailyExpense * day + extraOneTimeCost,
        ),
      });
    }

    const finalProjectedCash =
      chartData.length > 0
        ? chartData[chartData.length - 1].saldoProjetado
        : currentCash;

    return {
      currentCash,
      dailyIncomeBase,
      dailyExpenseBase,
      simulatedDailyIncome,
      simulatedDailyExpense,
      simulatedDailyNet,
      runwayDays,
      chartData,
      finalProjectedCash,
    };
  }, [
    transactions,
    revenueDelta,
    expenseDelta,
    extraOneTimeCost,
    forecastHorizon,
  ]);

  // Presets Rápidos de Cenários
  const applyPreset = (type: "stress" | "base" | "growth") => {
    if (type === "stress") {
      setRevenueDelta(-20);
      setExpenseDelta(15);
      setExtraOneTimeCost(5000);
    } else if (type === "growth") {
      setRevenueDelta(25);
      setExpenseDelta(-5);
      setExtraOneTimeCost(0);
    } else {
      setRevenueDelta(0);
      setExpenseDelta(0);
      setExtraOneTimeCost(0);
    }
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <TrendingUp size={16} className="text-slate-700" />
            Previsão de Fluxo de Caixa & Stress Testing
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Modelagem preditiva de liquidez, runway e cenários de choque
            financeiro
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {([30, 60, 90] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setForecastHorizon(h)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                forecastHorizon === h
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {h} Dias
            </button>
          ))}
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            title="Recarregar dados"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Cards Executivos de Solvência */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Caixa Atual */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">
            Saldo Atual em Caixa
          </span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {formatBRL(forecastMetrics.currentCash)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Posição consolidada hoje
          </span>
        </div>

        {/* Saldo Projetado */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">
            Saldo Projetado (D+{forecastHorizon})
          </span>
          <p
            className={`text-xl font-bold font-mono mt-1 ${
              forecastMetrics.finalProjectedCash >= 0
                ? "text-emerald-600"
                : "text-rose-600"
            }`}
          >
            {formatBRL(forecastMetrics.finalProjectedCash)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {forecastMetrics.finalProjectedCash >= forecastMetrics.currentCash
              ? "▲ Acúmulo de capital"
              : "▼ Consumo de reservas"}
          </span>
        </div>

        {/* Runway */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">
            Runway Operacional
          </span>
          <p
            className={`text-xl font-bold font-mono mt-1 ${
              forecastMetrics.runwayDays >= 90
                ? "text-emerald-600"
                : forecastMetrics.runwayDays >= 30
                  ? "text-amber-600"
                  : "text-rose-600"
            }`}
          >
            {forecastMetrics.runwayDays >= 999
              ? "Infinito (Superávit)"
              : `${forecastMetrics.runwayDays} dias`}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Sobrevivência sob queima líquida
          </span>
        </div>

        {/* Status de Risco */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">
            Grau de Solvência
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            {forecastMetrics.finalProjectedCash < 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertTriangle size={13} /> Risco de Insolvência
              </span>
            ) : forecastMetrics.simulatedDailyNet >= 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles size={13} /> Caixa Seguro & Superavitário
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Activity size={13} /> Queima Controlada
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Resultado diário: {formatBRL(forecastMetrics.simulatedDailyNet)}/dia
          </span>
        </div>
      </div>

      {/* Mesa de Controle de Cenários (Sliders & Presets) */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Mesa de Stress Testing & Hipóteses de Mercado
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1 hidden md:inline">
              Cenários Rápidos:
            </span>
            <button
              type="button"
              onClick={() => applyPreset("stress")}
              className="px-2.5 py-1 text-[10px] font-semibold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition cursor-pointer"
            >
              Crise (-20% Rec / +15% Custos)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("base")}
              className="px-2.5 py-1 text-[10px] font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition cursor-pointer"
            >
              Base (0%)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("growth")}
              className="px-2.5 py-1 text-[10px] font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition cursor-pointer"
            >
              Expansão (+25% Rec)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider Faturamento */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 flex items-center gap-1">
                <ArrowUpRight size={13} className="text-emerald-400" /> Variação
                na Receita:
              </span>
              <strong
                className={`font-mono font-bold ${
                  revenueDelta > 0
                    ? "text-emerald-400"
                    : revenueDelta < 0
                      ? "text-rose-400"
                      : "text-slate-400"
                }`}
              >
                {revenueDelta > 0 ? `+${revenueDelta}%` : `${revenueDelta}%`}
              </strong>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              step={5}
              value={revenueDelta}
              onChange={(e) => setRevenueDelta(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <p className="text-[10px] text-slate-400">
              Receita diária simulada:{" "}
              <strong className="text-slate-200">
                {formatBRL(forecastMetrics.simulatedDailyIncome)}/dia
              </strong>
            </p>
          </div>

          {/* Slider Despesas */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 flex items-center gap-1">
                <ArrowDownRight size={13} className="text-rose-400" /> Variação
                nas Despesas (OPEX):
              </span>
              <strong
                className={`font-mono font-bold ${
                  expenseDelta > 0
                    ? "text-rose-400"
                    : expenseDelta < 0
                      ? "text-emerald-400"
                      : "text-slate-400"
                }`}
              >
                {expenseDelta > 0 ? `+${expenseDelta}%` : `${expenseDelta}%`}
              </strong>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              step={5}
              value={expenseDelta}
              onChange={(e) => setExpenseDelta(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <p className="text-[10px] text-slate-400">
              Despesa diária simulada:{" "}
              <strong className="text-slate-200">
                {formatBRL(forecastMetrics.simulatedDailyExpense)}/dia
              </strong>
            </p>
          </div>

          {/* Slider Desembolso Não Previsto */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 flex items-center gap-1">
                <DollarSign size={13} className="text-amber-400" /> Desembolso
                Extra (CAPEX):
              </span>
              <strong className="font-mono font-bold text-amber-400">
                {formatBRL(extraOneTimeCost)}
              </strong>
            </div>
            <input
              type="range"
              min={0}
              max={50000}
              step={1000}
              value={extraOneTimeCost}
              onChange={(e) => setExtraOneTimeCost(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <p className="text-[10px] text-slate-400">
              Impacto imediato de passivos, rescisões ou reformas.
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico de Projeção Temporal */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Trajetória Temporal do Saldo em Caixa ({forecastHorizon} Dias)
          </h3>
          <p className="text-xs text-slate-500">
            Curva de liquidez acumulada considerando as premissas ativas
          </p>
        </div>

        <div className="w-full h-80 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={forecastMetrics.chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="colorSaldoForecast"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="dataCompleta"
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(val) =>
                  `R$ ${(Number(val) / 1000).toFixed(0)}k`
                }
              />
              <Tooltip
                formatter={(val: any) => [formatBRL(Number(val) || 0), ""]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <ReferenceLine
                y={0}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label="Ponto de Insolvência (R$ 0)"
              />
              <Area
                type="monotone"
                dataKey="saldoProjetado"
                name="Saldo Estimado em Caixa"
                stroke="#0f172a"
                strokeWidth={2.5}
                fill="url(#colorSaldoForecast)"
              />
              <Line
                type="monotone"
                dataKey="receitaAcumulada"
                name="Receitas Acumuladas"
                stroke="#10b981"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="despesaAcumulada"
                name="Despesas Acumuladas"
                stroke="#f43f5e"
                strokeWidth={1.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CashFlowForecast;
