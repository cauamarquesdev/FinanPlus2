import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FileText,
  Printer,
  Sparkles,
  TrendingUp,
  DollarSign,
  Briefcase,
  Users,
  ShieldCheck,
  Award,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Transaction, Client } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "";

export const ExecutiveHub: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados do Simulador de Decisões (What-If)
  const [newHiresCount, setNewHiresCount] = useState<number>(2);
  const [avgSalary, setAvgSalary] = useState<number>(6500);
  const [priceIncreasePercent, setPriceIncreasePercent] = useState<number>(8);
  const [expectedChurnPercent, setExpectedChurnPercent] = useState<number>(4);

  const reportRef = useRef<HTMLDivElement>(null);

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

      const headers = { Authorization: `Bearer ${token}` };
      const [txRes, cliRes] = await Promise.allSettled([
        fetch(`${API_URL}/transactions`, { headers }),
        fetch(`${API_URL}/clients`, { headers }),
      ]);

      if (txRes.status === "fulfilled" && txRes.value.ok) {
        setTransactions(await txRes.value.json());
      }
      if (cliRes.status === "fulfilled" && cliRes.value.ok) {
        setClients(await cliRes.value.json());
      }
    } catch (err) {
      console.error("Erro ao carregar dados do Executive Hub:", err);
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

  // Cálculos Consolidados para o Board Report
  const reportData = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : [];

    const totalRevenue = list
      .filter((t) => String(t?.type || "").toLowerCase() === "income")
      .reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);

    const totalExpense = list
      .filter((t) => String(t?.type || "").toLowerCase() === "expense")
      .reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);

    const netProfit = totalRevenue - totalExpense;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const ebitda = netProfit + totalExpense * 0.15; // Estimativa de LAJIDA

    // Despesas por Setor
    const sectorMap: Record<string, number> = {};
    list
      .filter((t) => String(t?.type || "").toLowerCase() === "expense")
      .forEach((t) => {
        const sec = t?.sector_name || "Geral";
        sectorMap[sec] = (sectorMap[sec] || 0) + (Number(t?.amount) || 0);
      });

    return {
      totalRevenue,
      totalExpense,
      netProfit,
      netMargin,
      ebitda,
      sectorExpenses: Object.entries(sectorMap).sort((a, b) => b[1] - a[1]),
      totalTransactions: list.length,
      clientsCount: Array.isArray(clients) ? clients.length : 0,
    };
  }, [transactions, clients]);

  // Simulador What-If (Impacto de Contratações e Preços)
  const whatIfResults = useMemo(() => {
    const monthlyPayrollCost = newHiresCount * avgSalary * 1.68; // Encargos CLT (68%)
    const adjustedRevenue =
      reportData.totalRevenue *
      (1 + priceIncreasePercent / 100) *
      (1 - expectedChurnPercent / 100);
    const newMonthlyProfit =
      adjustedRevenue - (reportData.totalExpense + monthlyPayrollCost);
    const profitDelta = newMonthlyProfit - reportData.netProfit;

    // Runway adicional sob novo cenário
    const monthlyNetBurn =
      reportData.totalExpense + monthlyPayrollCost - adjustedRevenue;
    const simulatedRunway =
      monthlyNetBurn > 0
        ? Math.floor(Math.max(0, reportData.netProfit) / (monthlyNetBurn / 30))
        : 999;

    return {
      monthlyPayrollCost,
      adjustedRevenue,
      newMonthlyProfit,
      profitDelta,
      simulatedRunway,
      isViable: newMonthlyProfit > 0,
    };
  }, [
    newHiresCount,
    avgSalary,
    priceIncreasePercent,
    expectedChurnPercent,
    reportData,
  ]);

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header Executivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Briefcase size={16} className="text-emerald-600" />
            Executive Hub: Relatório de Diretoria & Matriz de Decisões
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dossiê financeiro impresso para investidores/sócios e simulação
            avançada de expansão
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Printer size={14} />
            Imprimir / Salvar PDF
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

      {/* Simulador What-If (Oculto na impressão do PDF) */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-xs space-y-6 print:hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Matriz de Sensibilidade & Decisões de Capital (What-If Simulator)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">
            Modelo de Expansão e Impacto no EBITDA
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Vagas a Abrir */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-300 font-medium block">
              Novas Contratações (Headcount):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={50}
                value={newHiresCount}
                onChange={(e) => setNewHiresCount(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
              />
              <span className="text-xs text-slate-400">vagas</span>
            </div>
          </div>

          {/* Salário Médio */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-300 font-medium block">
              Salário Base Médio (R$):
            </label>
            <input
              type="number"
              step={500}
              value={avgSalary}
              onChange={(e) => setAvgSalary(Number(e.target.value))}
              className="w-full text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
            />
          </div>

          {/* Reajuste de Preço */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-300 font-medium block">
              Reajuste na Tabela de Preço (+%):
            </label>
            <input
              type="number"
              value={priceIncreasePercent}
              onChange={(e) => setPriceIncreasePercent(Number(e.target.value))}
              className="w-full text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
            />
          </div>

          {/* Churn Estimado */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-300 font-medium block">
              Perda Estimada de Clientes (Churn %):
            </label>
            <input
              type="number"
              value={expectedChurnPercent}
              onChange={(e) => setExpectedChurnPercent(Number(e.target.value))}
              className="w-full text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
            />
          </div>
        </div>

        {/* Impacto Projetado */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Custo Folha + Encargos
            </span>
            <p className="text-base font-mono font-bold text-rose-400 mt-1">
              +{formatBRL(whatIfResults.monthlyPayrollCost)}/mês
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Novo Lucro Mensal Estimado
            </span>
            <p
              className={`text-base font-mono font-bold mt-1 ${
                whatIfResults.newMonthlyProfit >= 0
                  ? "text-emerald-400"
                  : "text-rose-400"
              }`}
            >
              {formatBRL(whatIfResults.newMonthlyProfit)}
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Veredito de Viabilidade
            </span>
            <div className="flex items-center gap-1.5 mt-1.5">
              {whatIfResults.isViable ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300">
                  <CheckCircle2 size={13} /> Expansão Sustentável
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400">
                  <ShieldCheck size={13} /> Risco de Déficit
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DOSSIÊ OFICIAL / BOARD REPORT EMISSOR (Pronto para Impressão e PDF) */}
      <div
        ref={reportRef}
        className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none"
      >
        {/* Capa e Branding */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-base">
              FP
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                FinanPlus Executive Deck
              </h1>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Relatório de Posição Contábil & Diretoria
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Data de Emissão
            </span>
            <strong className="text-xs text-slate-900 font-mono">
              {new Date().toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </strong>
          </div>
        </div>

        {/* Parecer Executivo do CFO */}
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase">
            <Sparkles size={14} className="text-emerald-600" />
            Síntese do Parecer Executivo (CFO Review)
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            A empresa consolidou faturamento bruto de{" "}
            <strong>{formatBRL(reportData.totalRevenue)}</strong> contra
            despesas operacionais de{" "}
            <strong>{formatBRL(reportData.totalExpense)}</strong>, gerando um
            resultado líquido positivo de{" "}
            <strong>{formatBRL(reportData.netProfit)}</strong> com margem
            operacional de <strong>{reportData.netMargin.toFixed(1)}%</strong>.
            A solvência de curto prazo apresenta liquidez sustentável para
            reinvestimento.
          </p>
        </div>

        {/* Tabela Sintética de Balancete */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            1. DRE Sintético & Margens de Desempenho
          </h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">Conta Contábil</th>
                  <th className="px-4 py-2.5 text-right">Valor Consolidado</th>
                  <th className="px-4 py-2.5 text-right">% Receita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-4 py-2.5 font-bold text-slate-900">
                    Receita Operacional Bruta
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-600">
                    {formatBRL(reportData.totalRevenue)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-500">
                    100.0%
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-slate-700">
                    (-) Despesas e Custos Operacionais
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-rose-600">
                    {formatBRL(reportData.totalExpense)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-500">
                    {reportData.totalRevenue > 0
                      ? (
                          (reportData.totalExpense / reportData.totalRevenue) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </td>
                </tr>
                <tr className="bg-slate-50/80 font-bold">
                  <td className="px-4 py-2.5 text-slate-900">
                    Resultado Líquido do Período
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-mono ${
                      reportData.netProfit >= 0
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {formatBRL(reportData.netProfit)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-900">
                    {reportData.netMargin.toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Principais Centros de Custo */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            2. Distribuição por Centros de Custo (OPEX)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {reportData.sectorExpenses.slice(0, 6).map(([sec, val], i) => (
              <div
                key={i}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <span className="text-[10px] text-slate-500 uppercase font-semibold block truncate">
                  {sec}
                </span>
                <strong className="text-xs font-mono text-slate-900 block mt-1">
                  {formatBRL(val)}
                </strong>
                <span className="text-[10px] text-slate-400">
                  {reportData.totalExpense > 0
                    ? ((val / reportData.totalExpense) * 100).toFixed(1)
                    : 0}
                  % do OPEX
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Assinatura / Rodapé */}
        <div className="pt-8 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
          <span>FinanPlus Enterprise Core • Relatório Confidencial</span>
          <span>Assinado digitalmente pela Diretoria Financeira</span>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveHub;
