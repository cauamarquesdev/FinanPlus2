import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarDays,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  RefreshCw,
} from "lucide-react";
import { Transaction, Client } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface ClientScoreData {
  id: string | number;
  name: string;
  score: number;
  riskLevel: "low" | "moderate" | "attention" | "high";
  riskLabel: string;
  totalVolume: number;
  txCount: number;
  daysLate: number;
  onTimeRatio: number;
}

export const CreditAndSchedule: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  const loadData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const [txRes, clRes] = await Promise.all([
        fetch(`${API_URL}/transactions`, { headers }),
        fetch(`${API_URL}/clients`, { headers }),
      ]);

      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(Array.isArray(txData) ? txData : []);
      }
      if (clRes.ok) {
        const clData = await clRes.json();
        setClients(Array.isArray(clData) ? clData : []);
      }
    } catch (err) {
      console.error("Erro ao carregar dados para Score & Liquidez:", err);
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

  // 1. Motor do Mapa Térmico de Liquidez Diária (Dia 01 a 30)
  const dailySchedule = useMemo(() => {
    const days: {
      [day: number]: { income: number; expense: number; net: number };
    } = {};
    for (let i = 1; i <= 30; i++) {
      days[i] = { income: 0, expense: 0, net: 0 };
    }

    transactions.forEach((tx) => {
      const rawDate = tx.transaction_date || (tx as any).date;
      if (!rawDate) return;

      const dateObj = new Date(rawDate);
      const day = dateObj.getUTCDate();
      const amount = Number(tx.amount) || 0;
      const type = String(tx.type || "").toLowerCase();

      if (day >= 1 && day <= 30) {
        if (type === "income") {
          days[day].income += amount;
        } else if (type === "expense") {
          days[day].expense += amount;
        }
        days[day].net = days[day].income - days[day].expense;
      }
    });

    return days;
  }, [transactions]);

  // 2. Algoritmo de Score Comportamental por Cliente
  const clientScores = useMemo<ClientScoreData[]>(() => {
    if (!clients || clients.length === 0) return [];

    return clients.map((client) => {
      const clientName =
        client.company_name || (client as any).name || "Cliente";
      const clientId = client.id;

      // Filtra transações vinculadas a este cliente (por ID ou correspondência de texto na descrição)
      const clientTxs = transactions.filter((t) => {
        const matchesId =
          (t as any).client_id &&
          String((t as any).client_id) === String(clientId);
        const matchesDesc =
          t.description &&
          clientName &&
          t.description.toLowerCase().includes(clientName.toLowerCase());
        return matchesId || matchesDesc;
      });

      const incomeTxs = clientTxs.filter(
        (t) => String(t.type || "").toLowerCase() === "income",
      );
      const totalVolume = incomeTxs.reduce(
        (sum, t) => sum + (Number(t.amount) || 0),
        0,
      );
      const txCount = incomeTxs.length;

      // Base inicial neutra
      let calculatedScore = 50;

      // Fator 1: Volume financeiro histórico (até +25 pontos)
      if (totalVolume >= 50000) calculatedScore += 25;
      else if (totalVolume >= 20000) calculatedScore += 20;
      else if (totalVolume >= 5000) calculatedScore += 15;
      else if (totalVolume > 0) calculatedScore += 8;

      // Fator 2: Recorrência / Frequência (até +20 pontos)
      if (txCount >= 6) calculatedScore += 20;
      else if (txCount >= 3) calculatedScore += 12;
      else if (txCount >= 1) calculatedScore += 5;

      // Fator 3: Tipo de contrato ativo (+10 pontos)
      if (String(client.status || "").toLowerCase() === "active")
        calculatedScore += 5;
      if (String(client.type || "").toLowerCase() === "contract")
        calculatedScore += 5;

      // Limita score entre 10 e 99
      calculatedScore = Math.max(15, Math.min(98, Math.round(calculatedScore)));

      // Classificação do Grau de Risco
      let riskLevel: "low" | "moderate" | "attention" | "high" = "moderate";
      let riskLabel = "Médio Risco";

      if (calculatedScore >= 80) {
        riskLevel = "low";
        riskLabel = "Baixo Risco (Excelente)";
      } else if (calculatedScore >= 65) {
        riskLevel = "moderate";
        riskLabel = "Bom Pagador";
      } else if (calculatedScore >= 45) {
        riskLevel = "attention";
        riskLabel = "Atenção Moderada";
      } else {
        riskLevel = "high";
        riskLabel = "Alto Risco de Inadimplência";
      }

      return {
        id: clientId,
        name: clientName,
        score: calculatedScore,
        riskLevel,
        riskLabel,
        totalVolume,
        txCount,
        daysLate: 0,
        onTimeRatio: txCount > 0 ? 100 : 0,
      };
    });
  }, [clients, transactions]);

  // Copiar Régua de Cobrança Preventiva
  const handleCopyNotice = (client: ClientScoreData) => {
    const text = `Prezado(a) responsável pela ${client.name},\n\nIdentificamos em nosso sistema financeiro uma previsão de liquidação para os próximos dias no valor de ${formatBRL(
      client.totalVolume > 0 ? client.totalVolume : 1500,
    )}. Para facilitar sua conciliação, o boleto e a chave Pix já foram disponibilizados. Caso já tenha efetuado o pagamento, favor desconsiderar. Atenciosamente, Tesouraria.`;

    navigator.clipboard.writeText(text);
    setCopiedId(client.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <CalendarDays size={16} className="text-emerald-600" />
            Score de Crédito Comportamental & Liquidez Diária
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Análise preditiva de inadimplência baseada no histórico transacional
            e projeção diária de fluxo
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* MAPA TÉRMICO DE LIQUIDEZ DIÁRIA (01 A 30) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-slate-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Mapa Térmico de Liquidez Diária (Dia 01 a 30)
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Superávit
              no Dia
            </span>
            <span className="flex items-center gap-1.5 font-medium text-rose-700">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Déficit no
              Dia
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
            const data = dailySchedule[day] || { net: 0 };
            const hasActivity = data.net !== 0;
            const isPositive = data.net > 0;

            return (
              <div
                key={day}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                  !hasActivity
                    ? "bg-slate-50/60 border-slate-100 text-slate-400"
                    : isPositive
                      ? "bg-emerald-50/50 border-emerald-200/80 text-emerald-900 shadow-xs"
                      : "bg-rose-50/50 border-rose-200/80 text-rose-900 shadow-xs"
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Dia {day}
                </span>
                <span className="text-xs font-mono font-bold mt-0.5">
                  {hasActivity ? (
                    <span
                      className={
                        isPositive ? "text-emerald-700" : "text-rose-600"
                      }
                    >
                      {isPositive ? "" : "-"}
                      {formatBRL(Math.abs(data.net))}
                    </span>
                  ) : (
                    "—"
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SCORE DE RISCO & RÉGUA DE COBRANÇA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Score Comportamental de Crédito & Régua de Cobrança Preventiva
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            {clientScores.length} clientes calculados em tempo real
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="px-4 py-3">Tomador / Empresa</th>
                <th className="px-4 py-3 text-center">Score Calculado</th>
                <th className="px-4 py-3 text-center">Grau de Risco</th>
                <th className="px-4 py-3 text-right">Volume Histórico</th>
                <th className="px-4 py-3 text-center">Lançamentos</th>
                <th className="px-4 py-3 text-center">Aviso Preventivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientScores.map((cl) => (
                <tr key={cl.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3.5 font-semibold text-slate-900">
                    {cl.name}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-block font-mono font-bold px-2.5 py-0.5 rounded-full text-xs ${
                        cl.score >= 80
                          ? "bg-emerald-100 text-emerald-800"
                          : cl.score >= 60
                            ? "bg-blue-100 text-blue-800"
                            : cl.score >= 45
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {cl.score}/100
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
                        cl.riskLevel === "low"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : cl.riskLevel === "moderate"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : cl.riskLevel === "attention"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {cl.riskLevel === "low" || cl.riskLevel === "moderate" ? (
                        <ShieldCheck size={12} />
                      ) : (
                        <AlertTriangle size={12} />
                      )}
                      {cl.riskLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                    {formatBRL(cl.totalVolume)}
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-slate-600">
                    {cl.txCount} fatura{cl.txCount !== 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleCopyNotice(cl)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition cursor-pointer shadow-2xs"
                    >
                      {copiedId === cl.id ? (
                        <>
                          <Check size={13} className="text-emerald-400" />
                          <span className="text-emerald-300">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copiar Régua de Cobrança</span>
                        </>
                      )}
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

export default CreditAndSchedule;
