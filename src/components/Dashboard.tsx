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
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Wallet, TrendingUp, PieChart, DollarSign } from "lucide-react";

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

const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`${API_URL}/transactions`);

        if (!response.ok) {
          throw new Error("Erro ao buscar transações");
        }

        const data = await response.json();

        setTransactions(data);
      } catch (error) {
        console.error(error);
        setError("Não foi possível carregar as transações.");
      } finally {
        setLoading(false);
      }
    };

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
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
  }, [transactions]);

  const balance = totalIncome - totalExpenses;

  /*
   * ==============================
   * DADOS DOS GRÁFICOS
   * ==============================
   */

  const chartData = useMemo(() => {
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);

      const monthKey = format(date, "yyyy-MM");

      const income = transactions
        .filter(
          (transaction) =>
            transaction.type === "income" &&
            format(new Date(transaction.transaction_date), "yyyy-MM") ===
              monthKey,
        )
        .reduce((total, transaction) => total + Number(transaction.amount), 0);

      const expenses = transactions
        .filter(
          (transaction) =>
            transaction.type === "expense" &&
            format(new Date(transaction.transaction_date), "yyyy-MM") ===
              monthKey,
        )
        .reduce((total, transaction) => total + Number(transaction.amount), 0);

      months.push({
        name: format(date, "MMM", { locale: ptBR }),
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

  const latestTransactions = transactions.slice(0, 5);

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
   * RENDER
   * ==============================
   */

  return (
    <div className="p-6 space-y-6">
      {/* CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* SALDO */}

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center space-x-3">
            <Wallet className="text-blue-500" size={24} />

            <h3 className="text-lg font-semibold text-gray-700">Saldo Total</h3>
          </div>

          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(balance)}
          </p>

          <p className="text-sm text-gray-500 mt-1">Receitas - Despesas</p>
        </div>

        {/* RECEITAS */}

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center space-x-3">
            <TrendingUp className="text-green-500" size={24} />

            <h3 className="text-lg font-semibold text-gray-700">Receitas</h3>
          </div>

          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(totalIncome)}
          </p>

          <p className="text-sm text-green-500 mt-1">Entradas</p>
        </div>

        {/* DESPESAS */}

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center space-x-3">
            <PieChart className="text-red-500" size={24} />

            <h3 className="text-lg font-semibold text-gray-700">Despesas</h3>
          </div>

          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(totalExpenses)}
          </p>

          <p className="text-sm text-red-500 mt-1">Saídas</p>
        </div>

        {/* TRANSAÇÕES */}

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center space-x-3">
            <DollarSign className="text-yellow-500" size={24} />

            <h3 className="text-lg font-semibold text-gray-700">Transações</h3>
          </div>

          <p className="text-2xl font-bold text-gray-900 mt-2">
            {transactions.length}
          </p>

          <p className="text-sm text-gray-500 mt-1">Registradas</p>
        </div>
      </div>

      {/* GRÁFICOS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FLUXO DE CAIXA */}

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Fluxo de Caixa
          </h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  name="Receitas"
                />

                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#EF4444"
                  name="Despesas"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COMPARATIVO */}

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Comparativo Mensal
          </h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Legend />

                <Bar dataKey="income" fill="#10B981" name="Receitas" />

                <Bar dataKey="expenses" fill="#EF4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ÚLTIMAS TRANSAÇÕES */}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Últimas Transações
          </h3>

          {loading && <p className="text-gray-500">Carregando transações...</p>}

          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Setor
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {latestTransactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        Nenhuma transação cadastrada.
                      </td>
                    </tr>
                  ) : (
                    latestTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(
                            new Date(transaction.transaction_date),
                            "dd/MM/yyyy",
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.description || "Sem descrição"}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.client_name || "Sem cliente"}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.sector_name || "Sem setor"}
                        </td>

                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                            transaction.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}{" "}
                          {formatCurrency(Number(transaction.amount))}
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
