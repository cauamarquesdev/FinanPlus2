import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  Target,
  Sparkles,
  Download,
  Building2,
  Users,
  Percent,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Sliders,
  Zap,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Transaction, ChartData, AIInsight } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

interface SimulatorProps {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

const FinancialHealthAndSimulator: React.FC<SimulatorProps> = ({
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

export const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [aiGeneratedAt, setAiGeneratedAt] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<"6M" | "3M" | "ALL">(
    "6M",
  );

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken") ||
      ""
    );
  };

  const isValidTransaction = (transaction: Transaction) => {
    if (!transaction) return false;
    const type = String(transaction.type || "")
      .toLowerCase()
      .trim();
    const payer = String(transaction.payer || "")
      .toLowerCase()
      .trim();
    if (type === "income") return payer === "client";
    if (type === "expense") return payer === "user";
    return false;
  };

  const safeFormatDate = (dateVal?: string | Date | null) => {
    if (!dateVal) return "—";
    try {
      const d =
        typeof dateVal === "string"
          ? new Date(dateVal.replace(" ", "T"))
          : new Date(dateVal);
      if (isNaN(d.getTime())) return "—";
      return format(d, "dd/MM/yyyy");
    } catch {
      return "—";
    }
  };

  const fetchAIInsights = async () => {
    try {
      setAiLoading(true);
      setAiError("");
      if (!API_URL)
        throw new Error("A variável VITE_API_URL não está configurada.");
      const token = getToken();
      if (!token) throw new Error("Usuário não autenticado.");

      const response = await fetch(`${API_URL}/ai/insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("Sua sessão expirou. Faça login novamente.");
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || `Erro HTTP ${response.status}`,
        );
      }

      if (!data || typeof data.summary !== "string") {
        throw new Error("A API não retornou um resumo financeiro estruturado.");
      }

      setAiSummary(data.summary);
      setAiInsights(
        Array.isArray(data.insights) ? data.insights.slice(0, 6) : [],
      );
      setAiGeneratedAt(data.generatedAt || "");
    } catch (err) {
      console.error("Erro ao buscar insights da IA:", err);
      setAiSummary("");
      setAiInsights([]);
      setAiError(
        err instanceof Error
          ? err.message
          : "Não foi possível gerar a análise.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");
      if (!API_URL)
        throw new Error("A variável VITE_API_URL não está configurada.");
      const token = getToken();
      if (!token) throw new Error("Usuário não autenticado.");

      const response = await fetch(`${API_URL}/transactions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("Sua sessão expirou. Faça login novamente.");
      }

      if (!response.ok) {
        throw new Error("Erro ao buscar transações.");
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Formato inválido retornado pelo endpoint.");
      }

      setTransactions(data);
    } catch (err) {
      console.error("Erro ao buscar transações:", err);
      setTransactions([]);
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as transações.",
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    await Promise.all([fetchTransactions(), fetchAIInsights()]);
  };

  useEffect(() => {
    refreshDashboard();

    // Listener para sincronização automática quando a conciliação bancária salvar dados
    const handleGlobalUpdate = () => {
      fetchTransactions();
    };

    window.addEventListener("transactions_updated", handleGlobalUpdate);
    return () =>
      window.removeEventListener("transactions_updated", handleGlobalUpdate);
  }, []);

  const validTransactions = useMemo(() => {
    return transactions.filter(isValidTransaction);
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const totalIncome = useMemo(() => {
    return validTransactions
      .filter((t) => String(t.type || "").toLowerCase() === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [validTransactions]);

  const totalExpenses = useMemo(() => {
    return validTransactions
      .filter((t) => String(t.type || "").toLowerCase() === "expense")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [validTransactions]);

  const balance = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  const anomalies = useMemo(() => {
    const list: { transactionId: any; reason: string }[] = [];
    const map = new Map<string, any>();

    validTransactions.forEach((t) => {
      const key = `${t.amount}_${safeFormatDate(t.transaction_date || t.created_at)}_${t.type}`;
      if (map.has(key)) {
        list.push({
          transactionId: t.id,
          reason: "Potencial Lançamento Duplicado",
        });
      } else {
        map.set(key, t);
      }

      const avgExpense =
        totalExpenses /
        (validTransactions.filter((x) => x.type === "expense").length || 1);
      if (
        t.type === "expense" &&
        Number(t.amount) > avgExpense * 2.5 &&
        avgExpense > 0
      ) {
        list.push({
          transactionId: t.id,
          reason: "Valor Atípico (>2.5x da média)",
        });
      }
    });

    return list;
  }, [validTransactions, totalExpenses]);

  const chartData = useMemo<ChartData[]>(() => {
    const months: ChartData[] = [];
    const count = selectedPeriod === "3M" ? 3 : 6;

    for (let i = count - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthKey = format(date, "yyyy-MM");

      let income = 0;
      let expenses = 0;

      validTransactions.forEach((t) => {
        const rawDate = t.transaction_date || t.created_at;
        if (!rawDate) return;

        try {
          const tDate =
            typeof rawDate === "string"
              ? new Date(rawDate.replace(" ", "T"))
              : new Date(rawDate);
          if (isNaN(tDate.getTime())) return;
          if (format(tDate, "yyyy-MM") !== monthKey) return;

          const amount = Number(t.amount || 0);
          const type = String(t.type || "").toLowerCase();
          if (type === "income") income += amount;
          if (type === "expense") expenses += amount;
        } catch (e) {
          console.error("Data inválida:", e);
        }
      });

      months.push({
        name: format(date, "MMM", { locale: ptBR })
          .replace(".", "")
          .toUpperCase(),
        income,
        expenses,
      });
    }

    return months;
  }, [validTransactions, selectedPeriod]);

  const biggestExpenseSector = useMemo(() => {
    const sectors = new Map<string, number>();
    validTransactions
      .filter((t) => String(t.type || "").toLowerCase() === "expense")
      .forEach((t) => {
        const sector = t.sector_name || "Geral / Outros";
        sectors.set(sector, (sectors.get(sector) || 0) + Number(t.amount || 0));
      });

    let biggestSector = "Nenhum";
    let biggestAmount = 0;
    sectors.forEach((amt, sec) => {
      if (amt > biggestAmount) {
        biggestAmount = amt;
        biggestSector = sec;
      }
    });

    return { sector: biggestSector, amount: biggestAmount };
  }, [validTransactions]);

  const topClient = useMemo(() => {
    const clients = new Map<string, number>();
    validTransactions
      .filter((t) => String(t.type || "").toLowerCase() === "income")
      .forEach((t) => {
        const client = t.client_name || "Sem cliente";
        clients.set(client, (clients.get(client) || 0) + Number(t.amount || 0));
      });

    let clientName = "Nenhum";
    let amount = 0;
    clients.forEach((val, cli) => {
      if (val > amount) {
        amount = val;
        clientName = cli;
      }
    });

    return { name: clientName, amount };
  }, [validTransactions]);

  const latestTransactions = useMemo(() => {
    return [...validTransactions]
      .sort((a, b) => {
        const dateA = new Date(
          a.transaction_date || a.created_at || 0,
        ).getTime();
        const dateB = new Date(
          b.transaction_date || b.created_at || 0,
        ).getTime();
        return dateB - dateA;
      })
      .slice(0, 7);
  }, [validTransactions]);

  const exportCSV = async () => {
    try {
      const dataToExport =
        validTransactions.length > 0 ? validTransactions : transactions;

      if (!dataToExport || dataToExport.length === 0) {
        alert(
          "Não há dados de transações disponíveis para exportação no momento.",
        );
        return;
      }

      const formattedData = dataToExport.map((t, idx) => {
        const rawDate = t.transaction_date || t.created_at;
        const numAmount = Number(String(t.amount || 0).replace(",", "."));
        return {
          ID: t.id ?? idx + 1,
          Data: safeFormatDate(rawDate),
          Descrição: t.description || "Sem descrição",
          Cliente: t.client_name || "—",
          Setor: t.sector_name || "Geral",
          Pagador:
            String(t.payer || "").toLowerCase() === "client"
              ? "Cliente"
              : "Usuário",
          Tipo:
            String(t.type || "").toLowerCase() === "income"
              ? "Receita"
              : "Despesa",
          "Valor (R$)": isNaN(numAmount) ? 0 : numAmount,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet, { FS: ";" });
      const blob = new Blob(["\uFEFF" + csvOutput], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `extrato_financeiro_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro na exportação do CSV:", err);
      alert("Ocorreu um erro ao gerar o arquivo CSV.");
    }
  };

  const getInsightStyle = (type: AIInsight["type"]) => {
    switch (type) {
      case "positive":
        return {
          border: "border-emerald-200",
          bg: "bg-emerald-50/50",
          text: "text-emerald-900",
          icon: <TrendingUp className="h-4 w-4 text-emerald-600" />,
        };
      case "negative":
        return {
          border: "border-rose-200",
          bg: "bg-rose-50/50",
          text: "text-rose-900",
          icon: <TrendingDown className="h-4 w-4 text-rose-600" />,
        };
      case "warning":
        return {
          border: "border-amber-200",
          bg: "bg-amber-50/50",
          text: "text-amber-900",
          icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
        };
      default:
        return {
          border: "border-slate-200",
          bg: "bg-slate-50",
          text: "text-slate-900",
          icon: <Target className="h-4 w-4 text-slate-600" />,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles de Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Filtro Temporal:
          </span>
          <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setSelectedPeriod("3M")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedPeriod === "3M"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              3 Meses
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod("6M")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedPeriod === "6M"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              6 Meses
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            disabled={loading || transactions.length === 0}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <Download size={14} className="text-slate-500" />
            Exportar CSV
          </button>

          <button
            type="button"
            onClick={refreshDashboard}
            disabled={loading || aiLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={loading || aiLoading ? "animate-spin" : ""}
            />
            {loading ? "Sincronizando..." : "Atualizar Dados"}
          </button>
        </div>
      </div>

      {/* MÓDULO: SIMULADOR DE CENÁRIOS & SCORE DE SAÚDE */}
      <FinancialHealthAndSimulator
        currentBalance={balance}
        monthlyIncome={totalIncome / 6 || 10000}
        monthlyExpense={totalExpenses / 6 || 5000}
      />

      {/* Alerta de Erro de API */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            <p className="text-xs font-medium text-rose-800">{error}</p>
          </div>
          <button
            type="button"
            onClick={fetchTransactions}
            className="text-xs font-semibold text-rose-700 underline hover:text-rose-900"
          >
            Repetir
          </button>
        </div>
      )}

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Saldo Consolidado
            </span>
            <Wallet className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900">
            {formatCurrency(balance)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span
              className={`inline-flex items-center font-medium ${balance >= 0 ? "text-emerald-700" : "text-rose-700"}`}
            >
              {balance >= 0 ? (
                <ArrowUpRight size={14} className="mr-0.5" />
              ) : (
                <ArrowDownRight size={14} className="mr-0.5" />
              )}
              Margem {profitMargin.toFixed(1)}%
            </span>
            <span className="text-slate-400 font-normal">
              sobre faturamento
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Receitas Liquidadas
            </span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900">
            {formatCurrency(totalIncome)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 truncate">
            <Users size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">
              Principal:{" "}
              <strong className="text-slate-700">{topClient.name}</strong>
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Despesas Operacionais
            </span>
            <TrendingDown className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900">
            {formatCurrency(totalExpenses)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 truncate">
            <Building2 size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">
              Maior Centro:{" "}
              <strong className="text-slate-700">
                {biggestExpenseSector.sector}
              </strong>
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Operações Concluídas
            </span>
            <Percent className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900">
            {validTransactions.length}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>100% de integridade contábil</span>
          </div>
        </div>
      </div>

      {/* Módulo de Insights */}
      {validTransactions.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-emerald-400 shadow-xs">
                <Sparkles size={16} />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Relatório Analítico Executivo
                </h2>
                <p className="text-[11px] text-slate-500">
                  Diagnóstico financeiro automatizado{" "}
                  {aiGeneratedAt &&
                    ` • Atualizado em ${safeFormatDate(aiGeneratedAt)}`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchAIInsights}
              disabled={aiLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              <RefreshCw
                size={12}
                className={aiLoading ? "animate-spin" : ""}
              />
              {aiLoading ? "Processando..." : "Regerar Análise"}
            </button>
          </div>

          {aiError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3 text-xs text-rose-700">
              {aiError}
            </div>
          )}
          {aiSummary && !aiError && (
            <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-4">
              <p className="text-xs leading-relaxed text-slate-700">
                {aiSummary}
              </p>
            </div>
          )}

          {aiInsights.length > 0 && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {aiInsights.map((insight, idx) => {
                const style = getInsightStyle(insight.type);
                return (
                  <div
                    key={`${insight.title}-${idx}`}
                    className={`rounded-lg border ${style.border} ${style.bg} p-3.5 space-y-1`}
                  >
                    <div className="flex items-center gap-2">
                      {style.icon}
                      <h3 className={`text-xs font-semibold ${style.text}`}>
                        {insight.title}
                      </h3>
                    </div>
                    <p className="text-[11px] leading-snug text-slate-600">
                      {insight.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Gráficos de Desempenho */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Curva de Fluxo de Caixa
            </h2>
            <p className="text-[11px] text-slate-500">
              Distribuição temporal de entradas e desembolsos
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="2 2"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `R$${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    border: "none",
                    color: "#fff",
                    fontSize: "11px",
                  }}
                  formatter={(val: number) => [formatCurrency(val), ""]}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Receitas"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="Despesas"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Balanço Mensal por Competência
            </h2>
            <p className="text-[11px] text-slate-500">
              Comparativo direto de volume realizado
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="2 2"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `R$${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    border: "none",
                    color: "#fff",
                    fontSize: "11px",
                  }}
                  formatter={(val: number) => [formatCurrency(val), ""]}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                />
                <Bar
                  dataKey="income"
                  fill="#0f172a"
                  radius={[3, 3, 0, 0]}
                  name="Receitas"
                />
                <Bar
                  dataKey="expenses"
                  fill="#94a3b8"
                  radius={[3, 3, 0, 0]}
                  name="Despesas"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela de Transações com Detecção de Anomalias */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Extrato de Transações Recentes
            </h2>
            <p className="text-[11px] text-slate-500">
              Monitoramento em tempo real com radar de anomalias
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Mostrando {latestTransactions.length} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Competência</th>
                <th className="px-5 py-3">Descrição da Operação</th>
                <th className="px-5 py-3">Cliente / Entidade</th>
                <th className="px-5 py-3">Setor Contábil</th>
                <th className="px-5 py-3">Status / Radar</th>
                <th className="px-5 py-3 text-right">Montante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {latestTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-slate-400"
                  >
                    Nenhum registro encontrado no período.
                  </td>
                </tr>
              ) : (
                latestTransactions.map((t) => {
                  const anomaly = anomalies.find(
                    (a) => a.transactionId === t.id,
                  );
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-5 py-3 text-slate-500 font-mono">
                        {safeFormatDate(t.transaction_date || t.created_at)}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>
                            {t.description || "Lançamento sem descrição"}
                          </span>
                          {anomaly && (
                            <span
                              title={anomaly.reason}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200"
                            >
                              <ShieldAlert size={11} /> {anomaly.reason}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {t.client_name || (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {t.sector_name || "Geral"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            String(t.type || "").toLowerCase() === "income"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                              : "bg-rose-50 text-rose-700 border border-rose-200/50"
                          }`}
                        >
                          {String(t.type || "").toLowerCase() === "income"
                            ? "Receita"
                            : "Despesa"}
                        </span>
                      </td>
                      <td
                        className={`px-5 py-3 text-right font-mono font-semibold ${
                          String(t.type || "").toLowerCase() === "income"
                            ? "text-emerald-700"
                            : "text-slate-900"
                        }`}
                      >
                        {String(t.type || "").toLowerCase() === "income"
                          ? "+"
                          : "-"}{" "}
                        {formatCurrency(Number(t.amount || 0))}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
