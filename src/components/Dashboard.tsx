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
  TrendingDown,
  PieChart,
  DollarSign,
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  Target,
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

interface Insight {
  title: string;
  description: string;
  icon: React.ReactNode;
  type: "positive" | "negative" | "warning" | "neutral";
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
   * VALIDAR TRANSAÇÃO
   * ==============================
   *
   * Receita:
   * Cliente paga -> dinheiro entra
   *
   * Despesa:
   * Usuário paga -> dinheiro sai
   *
   * Transações incoerentes não entram
   * nos cálculos financeiros.
   */

  const isValidTransaction = (transaction: Transaction) => {
    if (transaction.type === "income") {
      return transaction.payer === "client";
    }

    if (transaction.type === "expense") {
      return transaction.payer === "user";
    }

    return false;
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
   * TRANSAÇÕES VÁLIDAS
   * ==============================
   */

  const validTransactions = useMemo(() => {
    return transactions.filter(isValidTransaction);
  }, [transactions]);

  /*
   * ==============================
   * FORMATAÇÃO
   * ==============================
   */

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatTransactionDate = (date: string) => {
    try {
      return format(parseISO(date), "dd/MM/yyyy");
    } catch {
      return "Data inválida";
    }
  };

  /*
   * ==============================
   * TOTAIS
   * ==============================
   */

  const totalIncome = useMemo(() => {
    return validTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce(
        (total, transaction) => total + Number(transaction.amount || 0),
        0,
      );
  }, [validTransactions]);

  const totalExpenses = useMemo(() => {
    return validTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce(
        (total, transaction) => total + Number(transaction.amount || 0),
        0,
      );
  }, [validTransactions]);

  const balance = totalIncome - totalExpenses;

  /*
   * ==============================
   * MARGEM
   * ==============================
   */

  const profitMargin = useMemo(() => {
    if (totalIncome <= 0) {
      return 0;
    }

    return (balance / totalIncome) * 100;
  }, [balance, totalIncome]);

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

      validTransactions.forEach((transaction) => {
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
  }, [validTransactions]);

  /*
   * ==============================
   * COMPARAÇÃO MENSAL
   * ==============================
   */

  const monthlyComparison = useMemo(() => {
    const currentMonth = chartData[chartData.length - 1];

    const previousMonth = chartData[chartData.length - 2];

    if (!currentMonth || !previousMonth) {
      return {
        incomeChange: 0,
        expenseChange: 0,
        balanceChange: 0,
      };
    }

    const currentBalance = currentMonth.income - currentMonth.expenses;

    const previousBalance = previousMonth.income - previousMonth.expenses;

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) {
        if (current === 0) {
          return 0;
        }

        return current > 0 ? 100 : -100;
      }

      return ((current - previous) / Math.abs(previous)) * 100;
    };

    return {
      incomeChange: calculateChange(currentMonth.income, previousMonth.income),

      expenseChange: calculateChange(
        currentMonth.expenses,
        previousMonth.expenses,
      ),

      balanceChange: calculateChange(currentBalance, previousBalance),
    };
  }, [chartData]);

  /*
   * ==============================
   * MAIOR DESPESA POR SETOR
   * ==============================
   */

  const biggestExpenseSector = useMemo(() => {
    const sectors = new Map<string, number>();

    validTransactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        const sector = transaction.sector_name || "Sem setor";

        const amount = Number(transaction.amount || 0);

        sectors.set(sector, (sectors.get(sector) || 0) + amount);
      });

    let biggestSector = "Nenhum";
    let biggestAmount = 0;

    sectors.forEach((amount, sector) => {
      if (amount > biggestAmount) {
        biggestAmount = amount;
        biggestSector = sector;
      }
    });

    return {
      sector: biggestSector,
      amount: biggestAmount,
    };
  }, [validTransactions]);

  /*
   * ==============================
   * PRINCIPAL CLIENTE
   * ==============================
   */

  const topClient = useMemo(() => {
    const clients = new Map<string, number>();

    validTransactions
      .filter((transaction) => transaction.type === "income")
      .forEach((transaction) => {
        const client = transaction.client_name || "Sem cliente";

        const amount = Number(transaction.amount || 0);

        clients.set(client, (clients.get(client) || 0) + amount);
      });

    let clientName = "Nenhum";
    let amount = 0;

    clients.forEach((value, client) => {
      if (value > amount) {
        amount = value;
        clientName = client;
      }
    });

    return {
      name: clientName,
      amount,
      percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
    };
  }, [validTransactions, totalIncome]);

  /*
   * ==============================
   * INSIGHTS
   * ==============================
   */

  const insights = useMemo<Insight[]>(() => {
    const generatedInsights: Insight[] = [];

    /*
     * Insight 1 - Resultado
     */

    if (balance > 0) {
      generatedInsights.push({
        title: "Resultado positivo",

        description: `Seu saldo atual é de ${formatCurrency(
          balance,
        )}. As receitas estão superando as despesas.`,

        icon: <TrendingUp size={20} />,

        type: "positive",
      });
    } else if (balance < 0) {
      generatedInsights.push({
        title: "Atenção ao caixa",

        description: `Suas despesas estão ${formatCurrency(
          Math.abs(balance),
        )} acima das receitas.`,

        icon: <AlertTriangle size={20} />,

        type: "negative",
      });
    } else {
      generatedInsights.push({
        title: "Resultado equilibrado",

        description:
          "Suas receitas e despesas estão atualmente no mesmo nível.",

        icon: <Target size={20} />,

        type: "neutral",
      });
    }

    /*
     * Insight 2 - Margem
     */

    if (totalIncome > 0) {
      if (profitMargin >= 30) {
        generatedInsights.push({
          title: "Boa margem financeira",

          description: `Sua margem atual é de ${profitMargin.toFixed(
            1,
          )}%, indicando uma boa relação entre receitas e despesas.`,

          icon: <TrendingUp size={20} />,

          type: "positive",
        });
      } else if (profitMargin >= 10) {
        generatedInsights.push({
          title: "Margem moderada",

          description: `Sua margem financeira está em ${profitMargin.toFixed(
            1,
          )}%. Existe espaço para melhorar o controle das despesas.`,

          icon: <Target size={20} />,

          type: "neutral",
        });
      } else {
        generatedInsights.push({
          title: "Margem baixa",

          description: `A margem financeira está em apenas ${profitMargin.toFixed(
            1,
          )}%. Vale revisar suas principais despesas.`,

          icon: <AlertTriangle size={20} />,

          type: "warning",
        });
      }
    }

    /*
     * Insight 3 - Despesas
     */

    if (totalExpenses > 0 && biggestExpenseSector.amount > 0) {
      const expensePercentage =
        (biggestExpenseSector.amount / totalExpenses) * 100;

      generatedInsights.push({
        title: "Maior concentração de despesas",

        description: `${
          biggestExpenseSector.sector
        } representa ${expensePercentage.toFixed(
          1,
        )}% das suas despesas, totalizando ${formatCurrency(
          biggestExpenseSector.amount,
        )}.`,

        icon: <PieChart size={20} />,

        type: expensePercentage >= 50 ? "warning" : "neutral",
      });
    }

    /*
     * Insight 4 - Tendência de receitas
     */

    if (monthlyComparison.incomeChange > 10) {
      generatedInsights.push({
        title: "Receitas em crescimento",

        description: `As receitas cresceram ${monthlyComparison.incomeChange.toFixed(
          1,
        )}% em relação ao mês anterior.`,

        icon: <TrendingUp size={20} />,

        type: "positive",
      });
    } else if (monthlyComparison.incomeChange < -10) {
      generatedInsights.push({
        title: "Queda nas receitas",

        description: `As receitas caíram ${Math.abs(
          monthlyComparison.incomeChange,
        ).toFixed(1)}% em relação ao mês anterior.`,

        icon: <TrendingDown size={20} />,

        type: "negative",
      });
    }

    /*
     * Insight 5 - Dependência de cliente
     */

    if (topClient.amount > 0 && topClient.percentage >= 50) {
      generatedInsights.push({
        title: "Alta dependência de um cliente",

        description: `${topClient.name} representa ${topClient.percentage.toFixed(
          1,
        )}% das suas receitas. Diversificar clientes pode reduzir riscos.`,

        icon: <AlertTriangle size={20} />,

        type: "warning",
      });
    }

    /*
     * Insight 6 - Despesas crescendo
     */

    if (monthlyComparison.expenseChange > 20) {
      generatedInsights.push({
        title: "Despesas em alta",

        description: `As despesas aumentaram ${monthlyComparison.expenseChange.toFixed(
          1,
        )}% em relação ao mês anterior.`,

        icon: <TrendingUp size={20} />,

        type: "warning",
      });
    }

    return generatedInsights.slice(0, 5);
  }, [
    balance,
    totalIncome,
    totalExpenses,
    profitMargin,
    biggestExpenseSector,
    topClient,
    monthlyComparison,
  ]);

  /*
   * ==============================
   * ÚLTIMAS TRANSAÇÕES
   * ==============================
   */

  const latestTransactions = useMemo(() => {
    return [...validTransactions]
      .sort((a, b) => {
        const dateA = new Date(a.transaction_date || a.created_at).getTime();

        const dateB = new Date(b.transaction_date || b.created_at).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [validTransactions]);

  /*
   * ==============================
   * RENDER
   * ==============================
   */

  return (
    <div className="w-full space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* CABEÇALHO */}

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

      {/* ERRO */}

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

      {/* AVISO DE TRANSAÇÕES INVÁLIDAS */}

      {!loading && transactions.length > validTransactions.length && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <AlertTriangle
            size={20}
            className="mt-0.5 flex-shrink-0 text-yellow-600"
          />

          <div>
            <p className="text-sm font-semibold text-yellow-800">
              Algumas transações não foram consideradas
            </p>

            <p className="mt-1 text-sm text-yellow-700">
              Existem transações com combinação inválida entre tipo e
              responsável pelo pagamento. Elas não entram nos cálculos do
              Dashboard.
            </p>
          </div>
        </div>
      )}

      {/* CARDS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* SALDO */}

        <div className="min-w-0 rounded-xl bg-white p-4 shadow-md sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Wallet className="text-blue-500" size={22} />
            </div>

            <h3 className="text-base font-semibold text-gray-700 sm:text-lg">
              Saldo Total
            </h3>
          </div>

          <p className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
            {formatCurrency(balance)}
          </p>

          <p className="mt-1 text-sm text-gray-500">Receitas - Despesas</p>
        </div>

        {/* RECEITAS */}

        <div className="min-w-0 rounded-xl bg-white p-4 shadow-md sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <TrendingUp className="text-green-500" size={22} />
            </div>

            <h3 className="text-base font-semibold text-gray-700 sm:text-lg">
              Receitas
            </h3>
          </div>

          <p className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
            {formatCurrency(totalIncome)}
          </p>

          <p className="mt-1 text-sm text-green-500">Clientes pagando</p>
        </div>

        {/* DESPESAS */}

        <div className="min-w-0 rounded-xl bg-white p-4 shadow-md sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <PieChart className="text-red-500" size={22} />
            </div>

            <h3 className="text-base font-semibold text-gray-700 sm:text-lg">
              Despesas
            </h3>
          </div>

          <p className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
            {formatCurrency(totalExpenses)}
          </p>

          <p className="mt-1 text-sm text-red-500">Usuário pagando</p>
        </div>

        {/* TRANSAÇÕES */}

        <div className="min-w-0 rounded-xl bg-white p-4 shadow-md sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
              <DollarSign className="text-yellow-500" size={22} />
            </div>

            <h3 className="text-base font-semibold text-gray-700 sm:text-lg">
              Transações
            </h3>
          </div>

          <p className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
            {validTransactions.length}
          </p>

          <p className="mt-1 text-sm text-gray-500">Válidas registradas</p>
        </div>
      </div>

      {/* INSIGHTS */}

      {!loading && validTransactions.length > 0 && (
        <section className="rounded-xl bg-white p-4 shadow-md sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Lightbulb size={21} className="text-blue-600" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-800 sm:text-lg">
                Insights Financeiros
              </h3>

              <p className="text-sm text-gray-500">
                Análise automática baseada nas suas transações.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {insights.map((insight, index) => {
              const style = {
                positive: "border-green-200 bg-green-50 text-green-700",

                negative: "border-red-200 bg-red-50 text-red-700",

                warning: "border-yellow-200 bg-yellow-50 text-yellow-700",

                neutral: "border-blue-200 bg-blue-50 text-blue-700",
              }[insight.type];

              return (
                <div
                  key={`${insight.title}-${index}`}
                  className={`rounded-xl border p-4 ${style}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">{insight.icon}</div>

                    <div className="min-w-0">
                      <h4 className="font-semibold">{insight.title}</h4>

                      <p className="mt-1 text-sm leading-5 opacity-90">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* GRÁFICOS */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        {/* FLUXO DE CAIXA */}

        <div className="min-w-0 rounded-xl bg-white p-4 shadow-md sm:p-6">
          <h3 className="mb-4 text-base font-semibold text-gray-700 sm:text-lg">
            Fluxo de Caixa
          </h3>

          <div className="h-64 w-full sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
              <BarChart data={chartData}>
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

      {/* ÚLTIMAS TRANSAÇÕES */}

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
              <table className="min-w-[800px] divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                      Data
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                      Descrição
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                      Cliente
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                      Setor
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                      Pagador
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                      Tipo
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                      Valor
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {latestTransactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
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
                        {/* DATA */}

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 sm:px-6">
                          {formatTransactionDate(
                            transaction.transaction_date ||
                              transaction.created_at,
                          )}
                        </td>

                        {/* DESCRIÇÃO */}

                        <td className="max-w-[200px] px-4 py-4 text-sm text-gray-900 sm:px-6">
                          <span
                            className="block truncate"
                            title={transaction.description || "Sem descrição"}
                          >
                            {transaction.description || "Sem descrição"}
                          </span>
                        </td>

                        {/* CLIENTE */}

                        <td className="max-w-[180px] px-4 py-4 text-sm text-gray-500 sm:px-6">
                          <span
                            className="block truncate"
                            title={transaction.client_name || "Sem cliente"}
                          >
                            {transaction.client_name || "Sem cliente"}
                          </span>
                        </td>

                        {/* SETOR */}

                        <td className="max-w-[150px] px-4 py-4 text-sm text-gray-500 sm:px-6">
                          <span
                            className="block truncate"
                            title={transaction.sector_name || "Sem setor"}
                          >
                            {transaction.sector_name || "Sem setor"}
                          </span>
                        </td>

                        {/* PAGADOR */}

                        <td className="whitespace-nowrap px-4 py-4 text-sm sm:px-6">
                          {transaction.payer === "client" ? (
                            <span className="font-medium text-green-600">
                              Cliente
                            </span>
                          ) : (
                            <span className="font-medium text-red-600">
                              Usuário
                            </span>
                          )}
                        </td>

                        {/* TIPO */}

                        <td className="whitespace-nowrap px-4 py-4 text-sm sm:px-6">
                          {transaction.type === "income" ? (
                            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                              Receita
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                              Despesa
                            </span>
                          )}
                        </td>

                        {/* VALOR */}

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
