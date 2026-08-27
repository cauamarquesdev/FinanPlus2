import React, { useState } from "react";
import {
  CreditCard,
  Plus,
  Clock,
  ShieldCheck,
  Download,
  X,
  CheckCircle2,
} from "lucide-react";

interface PaymentRecord {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: "paid" | "pending";
}

export const Payment: React.FC = () => {
  const [showCardModal, setShowCardModal] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardExpiry, setNewCardExpiry] = useState("");
  const [newCardHolder, setNewCardHolder] = useState("");

  const [invoices] = useState<PaymentRecord[]>([
    {
      id: "INV-2026-003",
      date: "15/08/2026",
      description: "Assinatura FinanPlus Enterprise",
      amount: "R$ 189,90",
      status: "paid",
    },
    {
      id: "INV-2026-002",
      date: "15/07/2026",
      description: "Assinatura FinanPlus Enterprise",
      amount: "R$ 189,90",
      status: "paid",
    },
    {
      id: "INV-2026-001",
      date: "15/06/2026",
      description: "Assinatura FinanPlus Enterprise",
      amount: "R$ 189,90",
      status: "paid",
    },
  ]);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCardModal(false);
    setNewCardNumber("");
    setNewCardExpiry("");
    setNewCardHolder("");
    alert("Método de pagamento cadastrado com sucesso.");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Plano & Próxima Cobrança */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
          Plano Ativo & Faturamento
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Gerencie as assinaturas corporativas e ciclo de liquidação
        </p>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                Plano Enterprise Core
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Ativo
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Próxima renovação automática em 15/09/2026
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
              <Clock size={13} />
              <span>Ciclo de faturamento mensal recorrente</span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Mensalidade</span>
            <span className="text-xl font-bold font-mono text-slate-900">
              R$ 189,90
            </span>
            <span className="text-[11px] text-slate-500 block">
              /mês (sem carência)
            </span>
          </div>
        </div>
      </div>

      {/* Cartões Cadastrados */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Métodos de Pagamento Cadastrados
            </h3>
            <p className="text-xs text-slate-500">
              Cartões corporativos habilitados para débito
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCardModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            <Plus size={13} />
            Novo Cartão
          </button>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-900 text-white">
                <CreditCard size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-mono font-bold text-slate-900">
                    Mastercard •••• 4242
                  </h4>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded border border-emerald-200/50">
                    Padrão
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Validade: 12/2028 • Titular: Diretoria Financeira
                </p>
              </div>
            </div>

            <button
              type="button"
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition"
            >
              Editar
            </button>
          </div>
        </div>
      </div>

      {/* Histórico de Faturas */}
      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
          Histórico de Faturas & Recibos
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Comprovantes fiscais gerados para a assinatura
        </p>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Competência</th>
                <th className="px-4 py-3">Identificador</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Montante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3 text-slate-500 font-mono">
                    {item.date}
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-slate-700">
                    {item.id}
                  </td>
                  <td className="px-4 py-3 text-slate-900">
                    {item.description}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                      Liquidado
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                    {item.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Novo Cartão */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Adicionar Cartão Corporativo
              </h3>
              <button
                type="button"
                onClick={() => setShowCardModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCard} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nome Gravado no Cartão
                </label>
                <input
                  type="text"
                  required
                  value={newCardHolder}
                  onChange={(e) => setNewCardHolder(e.target.value)}
                  placeholder="Ex: EMPRESA LTDA"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  placeholder="0000 0000 0000 0000"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Validade (MM/AA)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={newCardExpiry}
                    onChange={(e) => setNewCardExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    CVC / CVV
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="•••"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
                >
                  Salvar Cartão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
