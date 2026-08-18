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
} from "recharts";
import { format, subMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Wallet,
  TrendingUp,
  PieChart,
  DollarSign,
  RefreshCw,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface Transaction {
  id: number;
  client_id: number | null;
  client_name: string | null;
  sector_id: number | null;
  sector_name: string | null;
  type: "income" | "expense";
  payer: "client" | "user" | null;
  description: string | null;
  amount: string | number;
  transaction_date: string;
  created_at: string;
}

interface ChartData {
  name: string;
  income: number;
  expenses: number;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * ==============================
   * TOKEN
   * ==============================
   */

  const getToken = () => {
    return (
      localStorage.getItem("token") || sessionStorage.getItem("token") || ""
    );
  };

  /*
   * ==============================
   * BUSCAR TRANSAÇÕES
   * ==============================
   */

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      if (!API_URL) {
        throw new Error("A variável VITE_API_URL não está configurada.");
      }

      const token = getToken();

      if (!token) {
        throw new Error("Usuário não autenticado.");
      }

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
        throw new Error("Resposta inválida da API.");
      }

      setTransactions(data);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);

      setTransactions([]);

      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as transações.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  /*
   * ==============================
   * CÁLCULOS FINANCEIROS
   * ==============================
   */

  const totalIncome = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => {
        return total + Number(transaction.amount || 0);
      }, 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => {
        return total + Number(transaction.amount || 0);
      }, 0);
  }, [transactions]);

  const balance = totalIncome - totalExpenses;

  /*
   * ==============================
   * DADOS DOS GRÁFICOS
   * ==============================
   */

  const chartData = useMemo<ChartData[]>(() => {
    const months: ChartData[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);

      const monthKey = format(date, "yyyy-MM");

      let income = 0;
      let expenses = 0;

      transactions.forEach((transaction) => {
        if (!transaction.transaction_date) {
          return;
        }

        try {
          const transactionDate = parseISO(transaction.transaction_date);

          const transactionMonth = format(transactionDate, "yyyy-MM");

          if (transactionMonth !== monthKey) {
            return;
          }

          const amount = Number(transaction.amount || 0);

          if (transaction.type === "income") {
            income += amount;
          }

          if (transaction.type === "expense") {
            expenses += amount;
          }
        } catch (error) {
          console.error(
            "Data de transação inválida:",
            transaction.transaction_date,
            error,
          );
        }
      });

      months.push({
        name: format(date, "MMM", {
          locale: ptBR,
        }).replace(".", ""),
        income,
        expenses,
      });
    }

    return months;
  }, [transactions]);

  /*
   * ==============================
   * ÚLTIMAS TRANSAÇÕES
   * ==============================
   */

  const latestTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const dateA = new Date(a.transaction_date || a.created_at).getTime();

        const dateB = new Date(b.transaction_date || b.created_at).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [transactions]);

  /*
   * ==============================
   * FORMATAÇÃO DE VALORES
   * ==============================
   */

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  /*
   * ==============================
   * FORMATAÇÃO DE DATA
   * ==============================
   */

  const formatTransactionDate = (date: string) => {
    try {
      return format(parseISO(date), "dd/MM/yyyy");
    } catch {
      return "Data inválida";
    }
  };

  /*
   * ==============================
   * RENDER
   * ==============================
   */

  return (
    <div className="w-full space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* ============================== */}
      {/* CABEÇALHO */}
      {/* ============================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
            Visão Geral
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Acompanhe o desempenho financeiro da sua empresa.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTransactions}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>

      {/* ============================== */}
      {/* ERRO */}
      {/* ============================== */}

      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-red-600">{error}</p>

          <button
            type="button"
            onClick={fetchTransactions}
            className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 sm:w-auto"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* ============================== */}
      {/* CARDS */}
      {/* ============================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* SALDO */}

        <div className="min-w-0 rounded-xl bg-white p-4 shadow-md sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <Wallet className="text-blue-500" size={22} />
            </div>

            <h3 className="text-base font-semibold text-gray-700 sm:text-lg">
              Saldo Total
            </h3>
          </div>

          <p className="mt-2 break-words text-xl font-bold text-gray-900 sm:text-2xl">
            {formatCurrency(balance)}
          </p>

          <p className="mt-1 text-sm text-gray-500">Receitas - Despesas</p>
        </div>

        {/* RECEITAS */}

        <div className="min-w-0 rounded-xl bg-white p-4 shadow-md sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-50">
              <TrendingUp className="text-green-500" size={22} />
            </div>

            <h3 className="text-base font-semibold text-gray-700 sm:text-lg">
              Receitas
            </h3>
          </div>

          <p className="mt-2 break-words text-xl font-bold text-gray-900 sm:text-2xl">
            {formatCurrency(totalIncome)}
          </p>

          <p className="mt-1 text-sm text-green-500">Entradas</p>
        </div>

        {/* DESPESAS */}

        <div className="min-w-0 rounded-xl bg-white p-4 shadow-md sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-50">
              <PieChart className="text-red-500" size={22} />
            </div>

            <h3 className="text-base font-semibold text-gray-700 sm:text-lg">
              Despesas
            </h3>
          </div>

          <p className="mt-2 break-words text-xl font-bold text-gray-900 sm:text-2xl">
            {formatCurrency(totalExpenses)}
          </p>

          <p className="mt-1 text-sm text-red-500">Saídas</p>
        </div>

        {/* TRANSAÇÕES */}

        <div className="min-w-0 rounded-xl bg-white p-4 shadow-md sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-yellow-50">
              <DollarSign className="text-yellow-500" size={22} />
            </div>

            <h3 className="text-base font-semibold text-gray-700 sm:text-lg">
              Transações
            </h3>
          </div>

          <p className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
            {transactions.length}
          </p>

          <p className="mt-1 text-sm text-gray-500">Registradas</p>
        </div>
      </div>

      {/* ============================== */}
      {/* GRÁFICOS */}
      {/* ============================== */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        {/* FLUXO DE CAIXA */}

        <div className="min-w-0 rounded-xl bg-white p-4 shadow-md sm:p-6">
          <h3 className="mb-4 text-base font-semibold text-gray-700 sm:text-lg">
            Fluxo de Caixa
          </h3>

          <div className="h-64 w-full sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 5,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" tick={{ fontSize: 12 }} />

                <YAxis
                  tick={{ fontSize: 11 }}
                  width={50}
                  tickFormatter={(value) => `R$ ${value}`}
                />

                <Tooltip formatter={(value) => formatCurrency(Number(value))} />

                <Legend
                  wrapperStyle={{
                    fontSize: "12px",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  name="Receitas"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />

                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#EF4444"
                  name="Despesas"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COMPARATIVO */}

        <div className="min-w-0 rounded-xl bg-white p-4 shadow-md sm:p-6">
          <h3 className="mb-4 text-base font-semibold text-gray-700 sm:text-lg">
            Comparativo Mensal
          </h3>

          <div className="h-64 w-full sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 5,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" tick={{ fontSize: 12 }} />

                <YAxis
                  tick={{ fontSize: 11 }}
                  width={50}
                  tickFormatter={(value) => `R$ ${value}`}
                />

                <Tooltip formatter={(value) => formatCurrency(Number(value))} />

                <Legend
                  wrapperStyle={{
                    fontSize: "12px",
                  }}
                />

                <Bar
                  dataKey="income"
                  fill="#10B981"
                  name="Receitas"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="expenses"
                  fill="#EF4444"
                  name="Despesas"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ============================== */}
      {/* ÚLTIMAS TRANSAÇÕES */}
      {/* ============================== */}

      <div className="overflow-hidden rounded-xl bg-white shadow-md">
        <div className="p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold text-gray-700 sm:text-lg">
              Últimas Transações
            </h3>

            <span className="text-xs text-gray-400">Últimos 5 registros</span>
          </div>

          {loading && (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">Carregando transações...</p>
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-[650px] divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                      Data
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                      Descrição
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                      Cliente
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                      Setor
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                      Valor
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {latestTransactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-sm text-gray-500"
                      >
                        Nenhuma transação cadastrada.
                      </td>
                    </tr>
                  ) : (
                    latestTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 sm:px-6">
                          {formatTransactionDate(transaction.transaction_date)}
                        </td>

                        <td className="max-w-[200px] px-4 py-4 text-sm text-gray-900 sm:px-6">
                          <span
                            className="block truncate"
                            title={transaction.description || "Sem descrição"}
                          >
                            {transaction.description || "Sem descrição"}
                          </span>
                        </td>

                        <td className="max-w-[180px] px-4 py-4 text-sm text-gray-500 sm:px-6">
                          <span
                            className="block truncate"
                            title={transaction.client_name || "Sem cliente"}
                          >
                            {transaction.client_name || "Sem cliente"}
                          </span>
                        </td>

                        <td className="max-w-[150px] px-4 py-4 text-sm text-gray-500 sm:px-6">
                          <span
                            className="block truncate"
                            title={transaction.sector_name || "Sem setor"}
                          >
                            {transaction.sector_name || "Sem setor"}
                          </span>
                        </td>

                        <td
                          className={`whitespace-nowrap px-4 py-4 text-sm font-semibold sm:px-6 ${
                            transaction.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}{" "}
                          {formatCurrency(Number(transaction.amount || 0))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
