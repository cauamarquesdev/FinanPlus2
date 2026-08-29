import React, { useState } from "react";
import {
  ShieldCheck,
  CreditCard,
  Sparkles,
  CheckCircle2,
  Download,
  Calendar,
  Zap,
} from "lucide-react";

export const BillingSettings: React.FC = () => {
  const [downloading, setDownloading] = useState(false);

  const includedFeatures = [
    "CFO Copilot de IA Ilimitado (Gemini Multi-turn)",
    "Auditoria e Otimizador de Lucro Oculto (Recovery Engine)",
    "Central de Inteligência Corporativa & Valuation de M&A",
    "Previsão de Caixa com Stress Testing (D+30 a D+90)",
    "Análise de Lucratividade, Margens e EBITDA",
    "Score de Risco de Crédito & Régua de Cobrança",
    "Emissão do Executive Board Deck em PDF",
    "Conciliação Bancária OCR e Lançamentos Ilimitados",
    "Usuários e Workspaces Ilimitados",
  ];

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <CreditCard size={16} className="text-emerald-600" />
          Minha Assinatura & Faturamento
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Acesso completo e irrestrito a todas as ferramentas e inteligências do
          FinanPlus Enterprise.
        </p>
      </div>

      {/* Card Principal da Assinatura Ativa */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <ShieldCheck size={14} className="text-emerald-400" />
              Assinatura Ativa • Plano Único All-Inclusive
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              FinanPlus Enterprise
            </h1>
            <p className="text-xs text-slate-400">
              Renovação mensal automática • Próximo ciclo em 30 dias
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Valor da Mensalidade
            </span>
            <div className="flex items-baseline gap-1">
              <strong className="text-3xl font-mono font-bold text-emerald-400">
                R$ 197,00
              </strong>
              <span className="text-xs text-slate-400">/mês</span>
            </div>
          </div>
        </div>

        {/* Todas as Funcionalidades Inclusas */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
            Recursos 100% Liberados no seu Acesso:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {includedFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-slate-300 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60"
              >
                <CheckCircle2
                  size={14}
                  className="text-emerald-400 shrink-0 mt-0.5"
                />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Histórico de Faturas / Recibos */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          Histórico de Pagamentos & Comprovantes
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar size={15} className="text-slate-500" />
              <div>
                <strong className="text-slate-900 block">
                  Mensalidade FinanPlus Enterprise
                </strong>
                <span className="text-[11px] text-slate-400">
                  Pago via Cartão de Crédito (Final 4242)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono font-bold text-slate-900">
                R$ 197,00
              </span>
              <button
                type="button"
                onClick={() => {
                  setDownloading(true);
                  setTimeout(() => setDownloading(false), 1000);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition cursor-pointer"
              >
                <Download size={13} />
                {downloading ? "Baixando..." : "Recibo PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingSettings;
