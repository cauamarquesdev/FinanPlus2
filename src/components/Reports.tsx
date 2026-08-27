import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Scale,
  PieChart as PieIcon,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Transaction, Sector, ExtractedBankItem } from "../types";
import IncomeStatementDRE from "./IncomeStatementDRE";
import BankReconciliation from "./BankReconciliation";

const API_URL = import.meta.env.VITE_API_URL;
const PALETTE = [
  "#0f172a",
  "#334155",
  "#64748b",
  "#94a3b8",
  "#cbd5e1",
  "#10b981",
];

const Reports = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  const [sectorFilter, setSectorFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [payerFilter, setPayerFilter] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      if (!token) {
        alert("Sua sessão expirou. Faça login novamente.");
        window.location.href = "/";
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [transactionsResponse, sectorsResponse] = await Promise.all([
        fetch(`${API_URL}/transactions`, { method: "GET", headers }),
        fetch(`${API_URL}/sectors`, { method: "GET", headers }),
      ]);

      if (!transactionsResponse.ok || !sectorsResponse.ok) {
        throw new Error("Erro ao carregar dados do demonstrativo.");
      }

      const transactionsData = await transactionsResponse.json();
      const sectorsData = await sectorsResponse.json();

      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
      setSectors(Array.isArray(sectorsData) ? sectorsData : []);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSector =
        sectorFilter === "" || transaction.sector_id === Number(sectorFilter);
      const matchesType = typeFilter === "" || transaction.type === typeFilter;
      const matchesPayer =
        payerFilter === "" || transaction.payer === payerFilter;

      return matchesSector && matchesType && matchesPayer;
    });
  }, [transactions, sectorFilter, typeFilter, payerFilter]);

  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((total, t) => total + Number(t.amount || 0), 0);
  }, [filteredTransactions]);

  const totalExpenses = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((total, t) => total + Number(t.amount || 0), 0);
  }, [filteredTransactions]);

  const profit = totalIncome - totalExpenses;
  const marginPercentage = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;

  const monthlyData = useMemo(() => {
    const months: Record<
      string,
      {
        month: string;
        receitas: number;
        despesas: number;
        lucro: number;
      }
    > = {};

    filteredTransactions.forEach((transaction) => {
      const date = new Date(
        transaction.transaction_date || transaction.created_at || new Date(),
      );
      const month = date
        .toLocaleDateString("pt-BR", { month: "short" })
        .toUpperCase();
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

      if (!months[monthKey]) {
        months[monthKey] = {
          month,
          receitas: 0,
          despesas: 0,
          lucro: 0,
        };
      }

      const amt = Number(transaction.amount || 0);
      if (transaction.type === "income") {
        months[monthKey].receitas += amt;
      } else {
        months[monthKey].despesas += amt;
      }

      months[monthKey].lucro =
        months[monthKey].receitas - months[monthKey].despesas;
    });

    return Object.values(months);
  }, [filteredTransactions]);

  const expensesByCategory = useMemo(() => {
    const categories: Record<string, number> = {};

    filteredTransactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        const sector = transaction.sector_name || "Geral";
        categories[sector] =
          (categories[sector] || 0) + Number(transaction.amount || 0);
      });

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredTransactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const clearFilters = () => {
    setSectorFilter("");
    setTypeFilter("");
    setPayerFilter("");
  };

  const handleBatchConfirmReconciliation = async (
    items: ExtractedBankItem[],
  ) => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken") ||
        "";

      if (!token) {
        alert("Sua sessão expirou. Faça login novamente.");
        return;
      }

      const hasUnmatched = items.some((i) => i.status === "unmatched");
      const itemsToInsert = hasUnmatched
        ? items.filter((i) => i.status === "unmatched")
        : items;

      if (itemsToInsert.length === 0) {
        alert("Nenhum item pendente para gravação.");
        setLoading(false);
        return;
      }

      // Obtém o primeiro setor válido da lista
      const defaultSectorId = sectors.length > 0 ? sectors[0].id : null;

      let insertedCount = 0;
      let detailedError = "";

      for (const item of itemsToInsert) {
        let formattedDate = new Date().toISOString().split("T")[0];

        if (item.date) {
          const cleanDate = String(item.date).trim();
          if (cleanDate.includes("/")) {
            const parts = cleanDate.split("/");
            if (parts.length === 3) {
              const day = parts[0].padStart(2, "0");
              const month = parts[1].padStart(2, "0");
              const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
              formattedDate = `${year}-${month}-${day}`;
            }
          } else if (cleanDate.includes("-")) {
            const parts = cleanDate.split("-");
            if (parts.length === 3) {
              if (parts[0].length === 4) {
                formattedDate = cleanDate;
              } else {
                formattedDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
              }
            }
          }
        }

        const isIncome = String(item.type).toLowerCase() === "income";

        // Tenta achar setor correspondente
        const matchingSector = sectors.find(
          (s) =>
            item.suggestedSector &&
            s.name.toLowerCase().includes(item.suggestedSector.toLowerCase()),
        );

        const payload = {
          type: isIncome ? "income" : "expense",
          payer: isIncome ? "client" : "user",
          description: item.description || "Lançamento via Extrato",
          amount: Math.abs(Number(item.amount)),
          transaction_date: formattedDate,
          sector_id: matchingSector ? matchingSector.id : defaultSectorId,
        };

        try {
          const res = await fetch(`${API_URL}/transactions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            insertedCount++;
          } else {
            const errData = await res.json().catch(() => ({}));
            detailedError =
              errData.detail || errData.message || `Status HTTP ${res.status}`;
          }
        } catch (netErr: any) {
          detailedError = netErr?.message || "Erro de rede";
        }
      }

      if (insertedCount > 0) {
        window.dispatchEvent(new Event("transactions_updated"));
        alert(
          `${insertedCount} transações foram gravadas com sucesso no banco de dados!`,
        );
        await loadData();
      } else {
        alert(`Erro na gravação: ${detailedError}`);
      }
    } catch (err) {
      console.error("Erro geral na conciliação:", err);
      alert("Ocorreu um erro ao processar o extrato.");
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    if (filteredTransactions.length === 0) {
      alert("Não existem transações para exportar.");
      return;
    }

    const dataToExport = filteredTransactions.map((transaction) => ({
      Data: new Date(
        transaction.transaction_date || transaction.created_at || new Date(),
      ).toLocaleDateString("pt-BR"),
      Cliente: transaction.client_name || "—",
      Setor: transaction.sector_name || "—",
      Tipo: transaction.type === "income" ? "Receita" : "Despesa",
      Pagador:
        transaction.payer === "client"
          ? "Cliente"
          : transaction.payer === "user"
            ? "Usuário"
            : "Não informado",
      Descrição: transaction.description || "",
      Valor: Number(transaction.amount || 0),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Demonstrativo");
    XLSX.writeFile(workbook, `FinanPlus_Demonstrativo_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Demonstrativos e Balancetes
          </h2>
          <p className="text-xs text-slate-500">
            Relatórios analíticos consolidados por competência e centros de
            custo
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Sincronizar
          </button>
          <button
            type="button"
            onClick={exportExcel}
            disabled={filteredTransactions.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs transition disabled:opacity-50"
          >
            <FileSpreadsheet size={14} className="text-emerald-400" />
            Exportar XLS
          </button>
        </div>
      </div>

      {/* DRE Gerencial */}
      <IncomeStatementDRE transactions={filteredTransactions} />

      {/* Conciliação Bancária */}
      <BankReconciliation
        existingTransactions={transactions}
        onBatchConfirm={handleBatchConfirmReconciliation}
      />

      {/* Filtros Analíticos */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Segmentação e Filtros
            </span>
          </div>
          {(sectorFilter || typeFilter || payerFilter) && (
            <button
              onClick={clearFilters}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition"
            >
              Resetar Filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Centro de Custo / Setor
            </label>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">Todos os setores</option>
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Natureza da Operação
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">Receitas e Despesas (Todos)</option>
              <option value="income">Apenas Receitas</option>
              <option value="expense">Apenas Despesas</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Origem do Pagador
            </label>
            <select
              value={payerFilter}
              onChange={(e) => setPayerFilter(e.target.value)}
              className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">Todas as origens</option>
              <option value="client">Cliente (Tomador)</option>
              <option value="user">Usuário (Empresa)</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Receitas Brutas
            </span>
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900">
            {formatCurrency(totalIncome)}
          </p>
          <span className="text-[11px] text-slate-400 block mt-1">
            Créditos liquidados
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Despesas & Custos
            </span>
            <TrendingDown size={16} className="text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900">
            {formatCurrency(totalExpenses)}
          </p>
          <span className="text-[11px] text-slate-400 block mt-1">
            Débitos operacionais
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Resultado Líquido
            </span>
            <Scale size={16} className="text-slate-600" />
          </div>
          <p
            className={`mt-2 text-2xl font-bold font-mono tracking-tight ${
              profit >= 0 ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {formatCurrency(profit)}
          </p>
          <span className="text-[11px] text-slate-400 block mt-1">
            EBITDA estimado
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Margem Operacional
            </span>
            <PieIcon size={16} className="text-slate-600" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900">
            {marginPercentage.toFixed(1)}%
          </p>
          <span className="text-[11px] text-slate-400 block mt-1">
            Eficiência sobre a receita
          </span>
        </div>
      </div>

      {/* Gráficos Estruturados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Curva de Desempenho por Competência
            </h3>
            <p className="text-[11px] text-slate-500">
              Receitas, despesas e lucro distribuídos no período
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
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
                  dataKey="receitas"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Receitas"
                />
                <Line
                  type="monotone"
                  dataKey="despesas"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="Despesas"
                />
                <Line
                  type="monotone"
                  dataKey="lucro"
                  stroke="#0f172a"
                  strokeWidth={2}
                  dot={false}
                  name="Lucro Líquido"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Despesas por Centro de Custo
            </h3>
            <p className="text-[11px] text-slate-500">
              Distribuição percentual de desembolsos por setor
            </p>
          </div>

          <div className="h-72">
            {expensesByCategory.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Nenhum desembolso encontrado para os filtros ativos.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(Number(percent) * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    dataKey="value"
                  >
                    {expensesByCategory.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PALETTE[index % PALETTE.length]}
                      />
                    ))}
                  </Pie>
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
                    wrapperStyle={{ fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
