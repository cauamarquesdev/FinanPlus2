import React, { useState } from "react";
import {
  Mail,
  Smartphone,
  Calendar,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

export const Notifications: React.FC = () => {
  const [saved, setSaved] = useState(false);

  const [channels, setChannels] = useState({
    email: true,
    push: true,
    periodicReports: true,
  });

  const [events, setEvents] = useState({
    payments: true,
    dueInvoices: true,
    systemUpdates: false,
    newReports: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {saved && (
        <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <span>Matriz de alertas e notificações atualizada com sucesso.</span>
        </div>
      )}

      {/* Canais de Comunicação */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
          Canais de Entrega
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Escolha através de quais meios você deseja receber alertas
          operacionais
        </p>

        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                <Mail size={18} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">
                  Notificações por E-mail
                </h4>
                <p className="text-[11px] text-slate-500">
                  Comunicações formais e comprovantes de liquidação
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setChannels({ ...channels, email: !channels.email })
              }
              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                channels.email
                  ? "bg-slate-900 justify-end"
                  : "bg-slate-200 justify-start"
              }`}
            >
              <div className="h-4 w-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                <Smartphone size={18} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">
                  Push Notifications no Navegador
                </h4>
                <p className="text-[11px] text-slate-500">
                  Alertas instantâneos de aprovações pendentes
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setChannels({ ...channels, push: !channels.push })}
              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                channels.push
                  ? "bg-slate-900 justify-end"
                  : "bg-slate-200 justify-start"
              }`}
            >
              <div className="h-4 w-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                <Calendar size={18} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">
                  Relatórios Periódicos Consolidados
                </h4>
                <p className="text-[11px] text-slate-500">
                  Demonstrativo semanal/mensal automático do balancete
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setChannels({
                  ...channels,
                  periodicReports: !channels.periodicReports,
                })
              }
              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                channels.periodicReports
                  ? "bg-slate-900 justify-end"
                  : "bg-slate-200 justify-start"
              }`}
            >
              <div className="h-4 w-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* Gatilhos de Notificação */}
      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
          Gatilhos & Eventos
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Marque os eventos que devem disparar notificações
        </p>

        <div className="space-y-2.5">
          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={events.payments}
              onChange={(e) =>
                setEvents({ ...events, payments: e.target.checked })
              }
              className="rounded text-slate-900 focus:ring-0"
            />
            <span>Confirmações de liquidação de pagamentos e recebíveis</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={events.dueInvoices}
              onChange={(e) =>
                setEvents({ ...events, dueInvoices: e.target.checked })
              }
              className="rounded text-slate-900 focus:ring-0"
            />
            <span>
              Vencimento iminente de títulos e contratos com clientes (D-2)
            </span>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={events.newReports}
              onChange={(e) =>
                setEvents({ ...events, newReports: e.target.checked })
              }
              className="rounded text-slate-900 focus:ring-0"
            />
            <span>Disponibilidade de fechamento e balanços de competência</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={events.systemUpdates}
              onChange={(e) =>
                setEvents({ ...events, systemUpdates: e.target.checked })
              }
              className="rounded text-slate-900 focus:ring-0"
            />
            <span>Manutenções programadas da infraestrutura</span>
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-xs"
        >
          Salvar Preferências
        </button>
      </div>
    </div>
  );
};

export default Notifications;
