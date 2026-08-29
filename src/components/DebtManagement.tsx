import React, { useState, useEffect, useMemo } from "react";
import {
  CreditCard,
  AlertTriangle,
  ShieldCheck,
  Percent,
  RefreshCw,
  Plus,
  Trash2,
  Calendar,
  Scale,
} from "lucide-react";
import { Transaction } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "";

interface DebtItem {
  id: string;
  name: string;
  creditor: string;
  totalAmount: number;
  monthlyInstallment: number;
  remainingInstallments: number;
  interestRateMonthly: number;
}

export const DebtManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Lista de dívidas / empréstimos ativos (salvo em memória ou storage)
  const [debts, setDebts] = useState<DebtItem[]>([
    {
      id: "1",
      name: "Financiamento de Equipamentos TI",
      creditor: "Banco Itaú PJ",
      totalAmount: 45000,
      monthlyInstallment: 2450,
      remainingInstallments: 18,
      interestRateMonthly: 1.45,
    },
    {
      id: "2",
      name: "Capital de Giro Pronampe",
      creditor: "Banco do Brasil",
      totalAmount: 60000,
      monthlyInstallment: 3100,
      remainingInstallments: 20,
      interestRateMonthly: 1.15,
    },
  ]);

  // Form para nova dívida
  const [newName, setNewName] = useState("");
  const [newCreditor, setNewCreditor] = useState("");
  const [newTotal, setNewTotal] = useState<number>(0);
  const [newInstallment, setNewInstallment] = useState<number>(0);
  const [newRemaining, setNewRemaining] = useState<number>(12);
  const [newInterest, setNewInterest] = useState<number>(1.5);
  const [isAdding, setIsAdding] = useState(false);

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

      const res = await fetch(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Erro ao carregar dados de endividamento:", err);
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

  const debtMetrics = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : [];

    const totalIncome = list
      .filter((t) => String(t?.type || "").toLowerCase() === "income")
      .reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);

    const totalDebtBalance = debts.reduce(
      (sum, d) => sum + d.monthlyInstallment * d.remainingInstallments,
      0,
    );
    const monthlyDebtService = debts.reduce(
      (sum, d) => sum + d.monthlyInstallment,
      0,
    );

    // Taxa de Comprometimento da Receita (Dívida / Faturamento)
    const revenueCommitmentPercent =
      totalIncome > 0 ? (monthlyDebtService / totalIncome) * 100 : 0;

    // Custo Médio Ponderado dos Juros
    const weightedInterest =
      debts.length > 0
        ? debts.reduce((acc, d) => acc + d.interestRateMonthly, 0) /
          debts.length
        : 0;

    return {
      totalIncome,
      totalDebtBalance,
      monthlyDebtService,
      revenueCommitmentPercent,
      weightedInterest,
    };
  }, [debts, transactions]);

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || newTotal <= 0) return;

    const newDebt: DebtItem = {
      id: String(Date.now()),
      name: newName,
      creditor: newCreditor || "Instituição Financeira",
      totalAmount: newTotal,
      monthlyInstallment: newInstallment,
      remainingInstallments: newRemaining,
      interestRateMonthly: newInterest,
    };

    setDebts((prev) => [...prev, newDebt]);
    setNewName("");
    setNewCreditor("");
    setNewTotal(0);
    setNewInstallment(0);
    setIsAdding(false);
  };

  const handleDeleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Scale size={16} className="text-rose-600" />
            Gestão de Endividamento, Passivos & Alavancagem
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Controle de compromissos bancários, taxa de juros ponderada e
            comprometimento de receita
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus size={14} /> Novo Financiamento
          </button>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* KPIs de Endividamento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">
            Saldo Devedor Total Consolidado
          </span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-1">
            {formatBRL(debtMetrics.totalDebtBalance)}
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Passivo total a amortizar
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">
            Serviço da Dívida Mensal
          </span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {formatBRL(debtMetrics.monthlyDebtService)}/mês
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Parcelas debitadas mensalmente
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">
            Comprometimento de Receita
          </span>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xl font-bold font-mono text-slate-900">
              {debtMetrics.revenueCommitmentPercent.toFixed(1)}%
            </p>
            {debtMetrics.revenueCommitmentPercent <= 20 ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Saudável (≤ 20%)
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                Elevado (&gt; 20%)
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Da receita bruta consumida por dívidas
          </span>
        </div>
      </div>

      {/* Formulário de Adicionar Empréstimo */}
      {isAdding && (
        <form
          onSubmit={handleAddDebt}
          className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Cadastrar Novo Contrato de Dívida / Financiamento
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Nome da Dívida (ex: Capital de Giro)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900"
              required
            />
            <input
              type="text"
              placeholder="Credor / Banco (ex: Itaú PJ)"
              value={newCreditor}
              onChange={(e) => setNewCreditor(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900"
            />
            <input
              type="number"
              placeholder="Valor Total Contratado (R$)"
              value={newTotal || ""}
              onChange={(e) => setNewTotal(Number(e.target.value))}
              className="text-xs px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900"
              required
            />
            <input
              type="number"
              placeholder="Valor da Parcela Mensal (R$)"
              value={newInstallment || ""}
              onChange={(e) => setNewInstallment(Number(e.target.value))}
              className="text-xs px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900"
              required
            />
            <input
              type="number"
              placeholder="Parcelas Restantes (ex: 24)"
              value={newRemaining || ""}
              onChange={(e) => setNewRemaining(Number(e.target.value))}
              className="text-xs px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Taxa de Juros Mensal (% a.m.)"
              value={newInterest || ""}
              onChange={(e) => setNewInterest(Number(e.target.value))}
              className="text-xs px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
            >
              Salvar Contrato
            </button>
          </div>
        </form>
      )}

      {/* Lista de Financiamentos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          Contratos de Financiamento & Empréstimos Ativos ({debts.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="px-4 py-3">Contrato / Finalidade</th>
                <th className="px-4 py-3">Credor / Banco</th>
                <th className="px-4 py-3 text-right">Parcela Mensal</th>
                <th className="px-4 py-3 text-center">Parcelas Restantes</th>
                <th className="px-4 py-3 text-center">Taxa de Juros</th>
                <th className="px-4 py-3 text-right">Saldo Devedor</th>
                <th className="px-4 py-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {debts.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {d.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{d.creditor}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-rose-600">
                    {formatBRL(d.monthlyInstallment)}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-slate-600">
                    {d.remainingInstallments} meses
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-medium text-slate-700">
                    {d.interestRateMonthly.toFixed(2)}% a.m.
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    {formatBRL(d.monthlyInstallment * d.remainingInstallments)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteDebt(d.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Excluir contrato"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DebtManagement;
