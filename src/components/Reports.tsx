import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { Download, Filter } from "lucide-react";
import * as XLSX from "xlsx";

interface Transaction {
  id: number;
  client_id: number;
  client_name: string;
  sector_id: number;
  sector_name: string;
  type: "income" | "expense";
  payer: "client" | "user" | null;
  description: string;
  amount: string;
  transaction_date: string;
  created_at: string;
}

interface Sector {
  id: number;
  name: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const Reports = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);

  const [loading, setLoading] = useState(true);

  const [sectorFilter, setSectorFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [payerFilter, setPayerFilter] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [transactionsResponse, sectorsResponse] = await Promise.all([
          fetch("http://localhost:3000/transactions"),
          fetch("http://localhost:3000/sectors"),
        ]);

        if (!transactionsResponse.ok) {
          throw new Error("Erro ao buscar transações");
        }

        if (!sectorsResponse.ok) {
          throw new Error("Erro ao buscar setores");
        }

        const transactionsData = await transactionsResponse.json();

        const sectorsData = await sectorsResponse.json();

        setTransactions(transactionsData);
        setSectors(sectorsData);
      } catch (error) {
        console.error("Erro ao carregar relatórios:", error);
      } finally {
        setLoading(false);
      }
    };

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
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
  }, [filteredTransactions]);

  const totalExpenses = useMemo(() => {
    return filteredTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
  }, [filteredTransactions]);

  const profit = totalIncome - totalExpenses;

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
      const date = new Date(transaction.transaction_date);

      const month = date.toLocaleDateString("pt-BR", {
        month: "short",
      });

      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

      if (!months[monthKey]) {
        months[monthKey] = {
          month,
          receitas: 0,
          despesas: 0,
          lucro: 0,
        };
      }

      if (transaction.type === "income") {
        months[monthKey].receitas += Number(transaction.amount);
      } else {
        months[monthKey].despesas += Number(transaction.amount);
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
        const sector = transaction.sector_name;

        if (!categories[sector]) {
          categories[sector] = 0;
        }

        categories[sector] += Number(transaction.amount);
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

  const exportData = () => {
    if (filteredTransactions.length === 0) {
      alert("Não existem transações para exportar.");
      return;
    }

    const dataToExport = filteredTransactions.map((transaction) => ({
      Data: new Date(transaction.transaction_date).toLocaleDateString("pt-BR"),

      Cliente: transaction.client_name,

      Setor: transaction.sector_name,

      Tipo: transaction.type === "income" ? "Receita" : "Despesa",

      Pagador:
        transaction.payer === "client"
          ? "Cliente"
          : transaction.payer === "user"
            ? "Usuário"
            : "Não informado",

      Descrição: transaction.description || "",

      Valor: Number(transaction.amount),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Transações");

    XLSX.writeFile(workbook, "FinanPlus_Relatorio.xlsx");
  };

  return (
    <div className="p-6 space-y-6">
      {/* CABEÇALHO */}

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Relatórios Financeiros
        </h2>

        <button
          onClick={exportData}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download size={20} />
          Exportar Excel
        </button>
      </div>

      {/* FILTROS */}

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />

          <h3 className="text-lg font-semibold text-gray-700">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SETOR */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Setor
            </label>

            <select
              value={sectorFilter}
              onChange={(event) => setSectorFilter(event.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todos os setores</option>

              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
          </div>

          {/* TIPO */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Receitas e despesas</option>

              <option value="income">Receitas</option>

              <option value="expense">Despesas</option>
            </select>
          </div>

          {/* PAGADOR */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pagador
            </label>

            <select
              value={payerFilter}
              onChange={(event) => setPayerFilter(event.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todos</option>

              <option value="client">Cliente</option>

              <option value="user">Usuário</option>
            </select>
          </div>
        </div>

        <button
          onClick={clearFilters}
          className="mt-4 text-sm text-blue-600 hover:text-blue-800"
        >
          Limpar filtros
        </button>
      </div>

      {/* INDICADORES */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-sm text-gray-500">Receitas</p>

          <p className="text-2xl font-bold text-green-600 mt-2">
            {formatCurrency(totalIncome)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-sm text-gray-500">Despesas</p>

          <p className="text-2xl font-bold text-red-600 mt-2">
            {formatCurrency(totalExpenses)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-sm text-gray-500">Resultado</p>

          <p
            className={`text-2xl font-bold mt-2 ${
              profit >= 0 ? "text-blue-600" : "text-red-600"
            }`}
          >
            {formatCurrency(profit)}
          </p>
        </div>
      </div>

      {/* GRÁFICOS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DESEMPENHO */}

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Desempenho Financeiro
          </h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip formatter={(value) => formatCurrency(Number(value))} />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="receitas"
                  stroke="#10B981"
                  name="Receitas"
                />

                <Line
                  type="monotone"
                  dataKey="despesas"
                  stroke="#EF4444"
                  name="Despesas"
                />

                <Line
                  type="monotone"
                  dataKey="lucro"
                  stroke="#6366F1"
                  name="Lucro"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DESPESAS POR SETOR */}

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Despesas por Setor
          </h3>

          <div className="h-80">
            {expensesByCategory.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                Nenhuma despesa encontrada.
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
                      `${name} ${(Number(percent) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ANÁLISE MENSAL */}

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Análise Mensal
        </h3>

        <div className="h-80">
          {monthlyData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              Nenhuma transação encontrada.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip formatter={(value) => formatCurrency(Number(value))} />

                <Legend />

                <Bar dataKey="receitas" fill="#10B981" name="Receitas" />

                <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />

                <Bar dataKey="lucro" fill="#6366F1" name="Lucro" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* TABELA */}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Transações
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cliente
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Setor
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Pagador
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Descrição
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Valor
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Nenhuma transação encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(
                          transaction.transaction_date,
                        ).toLocaleDateString("pt-BR")}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.client_name}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.sector_name}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.type === "income"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.type === "income"
                            ? "Receita"
                            : "Despesa"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.payer === "client"
                          ? "Cliente"
                          : transaction.payer === "user"
                            ? "Usuário"
                            : "—"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description || "—"}
                      </td>

                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(Number(transaction.amount))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
