import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarDays,
  ShieldAlert,
  ShieldCheck,
  Send,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { Transaction, Client } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "";

export const CreditAndSchedule: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      console.error("Erro ao carregar dados de crédito e calendário:", err);
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

  // 1. Motor de Score de Inadimplência e Risco de Crédito por Cliente
  const clientRiskScores = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : [];
    const clientMap: Record<
      string,
      { totalVolume: number; count: number; clientName: string }
    > = {};

    list
      .filter((t) => String(t?.type || "").toLowerCase() === "income")
      .forEach((t) => {
        const name = t?.client_name || "Cliente Avulso";
        if (!clientMap[name]) {
          clientMap[name] = { totalVolume: 0, count: 0, clientName: name };
        }
        clientMap[name].totalVolume += Number(t?.amount) || 0;
        clientMap[name].count += 1;
      });

    return Object.values(clientMap).map((c) => {
      // Score baseado em recorrência e volume
      let score = 85;
      let riskLevel: "low" | "medium" | "high" = "low";

      if (c.count >= 3) {
        score = 95;
        riskLevel = "low";
      } else if (c.count === 2) {
        score = 75;
        riskLevel = "medium";
      } else {
        score = 55;
        riskLevel = "high";
      }

      const defaultReminderText = `Olá equipe da ${c.clientName}, passando para lembrá-los do fechamento de faturamento deste ciclo no valor de ${formatBRL(
        c.totalVolume,
      )}. O boleto e a NF estão disponíveis no portal. Obrigado!`;

      return {
        ...c,
        score,
        riskLevel,
        reminderText: defaultReminderText,
      };
    });
  }, [transactions]);

  // 2. Calendário Financeiro Diário com Heatmap de Liquidez
  const calendarDays = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : [];
    const daysInMonth = 30;
    const dailyData: Array<{
      day: number;
      inflow: number;
      outflow: number;
      net: number;
      isNegative: boolean;
    }> = [];

    // Mapeamento diário
    for (let d = 1; d <= daysInMonth; d++) {
      const dayTxs = list.filter((t) => {
        if (!t.transaction_date) return false;
        const dayNum = parseInt(
          String(t.transaction_date).split("-")[2] || "0",
          10,
        );
        return dayNum === d;
      });

      const inflow = dayTxs
        .filter((t) => String(t?.type || "").toLowerCase() === "income")
        .reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);

      const outflow = dayTxs
        .filter((t) => String(t?.type || "").toLowerCase() === "expense")
        .reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);

      const net = inflow - outflow;

      dailyData.push({
        day: d,
        inflow,
        outflow,
        net,
        isNegative: net < 0,
      });
    }

    return dailyData;
  }, [transactions]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <CalendarDays size={16} className="text-emerald-600" />
            Credit Score de Clientes & Calendário de Liquidez Diária
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Prevenção de inadimplência, régua de cobrança e mapa térmico diário
            de entradas/saídas
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

      {/* Calendário Heatmap de Liquidez Diária */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-slate-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Mapa Térmico de Liquidez Diária (Dia 01 a 30)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Superávit
              no Dia
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Déficit no
              Dia
            </span>
          </div>
        </div>

        {/* Grade do Calendário */}
        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2.5">
          {calendarDays.map((d) => (
            <div
              key={d.day}
              className={`p-2.5 rounded-xl border text-center transition ${
                d.inflow === 0 && d.outflow === 0
                  ? "bg-slate-50 border-slate-200/70"
                  : d.isNegative
                    ? "bg-rose-50/70 border-rose-200"
                    : "bg-emerald-50/70 border-emerald-200"
              }`}
            >
              <span className="text-[10px] font-bold text-slate-500 block">
                Dia {d.day}
              </span>
              <p
                className={`text-xs font-mono font-bold mt-1 ${
                  d.net > 0
                    ? "text-emerald-700"
                    : d.net < 0
                      ? "text-rose-700"
                      : "text-slate-400"
                }`}
              >
                {d.net !== 0 ? formatBRL(d.net) : "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Score & Régua de Cobrança por Cliente */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Users size={16} className="text-slate-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Score de Risco de Pagamento & Régua de Cobrança Preventiva
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="px-4 py-3">Tomador / Empresa</th>
                <th className="px-4 py-3 text-center">Score de Crédito</th>
                <th className="px-4 py-3 text-center">Grau de Risco</th>
                <th className="px-4 py-3 text-right">Volume Histórico</th>
                <th className="px-4 py-3 text-center">
                  Aviso Preventivo (WhatsApp/E-mail)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientRiskScores.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-6 text-slate-400 text-xs"
                  >
                    Nenhum histórico de cliente para análise de crédito.
                  </td>
                </tr>
              ) : (
                clientRiskScores.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {c.clientName}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          c.score >= 80
                            ? "bg-emerald-100 text-emerald-800"
                            : c.score >= 60
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {c.score}/100
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.riskLevel === "low" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          <ShieldCheck size={12} /> Baixo Risco
                        </span>
                      )}
                      {c.riskLevel === "medium" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          <AlertTriangle size={12} /> Monitorar
                        </span>
                      )}
                      {c.riskLevel === "high" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                          <ShieldAlert size={12} /> Atenção
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {formatBRL(c.totalVolume)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(c.reminderText, String(idx))
                        }
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[11px] font-medium transition cursor-pointer"
                      >
                        {copiedId === String(idx) ? (
                          <>
                            <Check size={12} className="text-emerald-400" />{" "}
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copiar Régua de Cobrança
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CreditAndSchedule;
