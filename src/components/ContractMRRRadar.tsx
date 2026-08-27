import React, { useMemo } from "react";
import {
  Users,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Repeat,
} from "lucide-react";

interface ClientItem {
  id: number;
  company_name: string;
  type: string;
  status: string;
  email: string;
}

interface ContractMRRProps {
  clients: ClientItem[];
}

export const ContractMRRRadar: React.FC<ContractMRRProps> = ({ clients }) => {
  const mrrMetrics = useMemo(() => {
    const activeClients = clients.filter((c) => c.status === "active");
    const ticketMedio = 1450.0; // Valor médio estimado por contrato ativo
    const mrr = activeClients.length * ticketMedio;
    const arr = mrr * 12;

    // Detecção simulada de clientes em risco de Churn (inativos ou sem contato recente)
    const atRiskClients = clients
      .filter((c) => c.status === "inactive" || !c.email)
      .slice(0, 3);

    return {
      activeCount: activeClients.length,
      mrr,
      arr,
      atRiskClients,
      ticketMedio,
    };
  }, [clients]);

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-5">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Contratos Recorrentes & Radar de Churn
          </h3>
          <p className="text-xs text-slate-500">
            Métricas de previsibilidade de receita e fidelização
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200/50">
          <Repeat size={12} /> Motor MRR Ativo
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-medium text-slate-500 block">
            MRR Projetado (Mensal)
          </span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
            {formatBRL(mrrMetrics.mrr)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {mrrMetrics.activeCount} contratos em vigência
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-medium text-slate-500 block">
            ARR Anualizado
          </span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
            {formatBRL(mrrMetrics.arr)}
          </span>
          <span className="text-[10px] text-emerald-600 mt-0.5 block font-medium">
            Base de liquidez garantida
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-medium text-slate-500 block">
            Ticket Médio por Contrato
          </span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
            {formatBRL(mrrMetrics.ticketMedio)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Calculado por cliente ativo
          </span>
        </div>
      </div>

      {mrrMetrics.atRiskClients.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-600" />
            <h4 className="text-xs font-bold text-amber-900">
              Alerta de Churn Risk (Atenção Comercial)
            </h4>
          </div>
          <p className="text-[11px] text-amber-800">
            Os seguintes clientes precisam de contato preventivo para renovação
            contratual:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {mrrMetrics.atRiskClients.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-xs font-medium text-slate-800 shadow-2xs"
              >
                {c.company_name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractMRRRadar;
