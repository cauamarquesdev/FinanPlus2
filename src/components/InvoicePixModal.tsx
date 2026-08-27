import React, { useState } from "react";
import {
  QrCode,
  Copy,
  Check,
  Download,
  X,
  Building2,
  ShieldCheck,
  Printer,
} from "lucide-react";

interface InvoicePixModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  amount: number;
  description: string;
  dueDate: string;
}

export const InvoicePixModal: React.FC<InvoicePixModalProps> = ({
  isOpen,
  onClose,
  clientName,
  amount,
  description,
  dueDate,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Payload padrão BR Code / PIX estático
  const pixPayload = `00020126580014br.gov.bcb.pix0136finanplus-pix@empresa.com.br520400005303986540${amount.toFixed(2).length + 4}${amount.toFixed(2)}5802BR5925FINANPLUS TECNOLOGIA SA6009SAO PAULO62070503***6304`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs">
              FP
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Fatura & Cobrança PIX
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                DOC #{Date.now().toString().slice(-6)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Dados da Fatura */}
          <div className="grid grid-cols-2 gap-4 text-xs pb-4 border-b border-slate-100">
            <div>
              <span className="text-slate-400 block mb-0.5">
                Tomador / Cliente:
              </span>
              <strong className="text-slate-900 font-semibold">
                {clientName}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Vencimento:</span>
              <strong className="text-slate-900 font-mono">{dueDate}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block mb-0.5">
                Memorial Descritivo:
              </span>
              <p className="text-slate-700">
                {description || "Prestação de serviços corporativos"}
              </p>
            </div>
          </div>

          {/* QR Code & Total */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="h-32 w-32 bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-center shadow-xs">
              <QrCode size={110} className="text-slate-900" />
            </div>

            <div className="flex-1 text-center sm:text-right space-y-1">
              <span className="text-xs text-slate-500 block">
                Total a Liquidar
              </span>
              <span className="text-2xl font-bold font-mono text-slate-900 block">
                {formatBRL(amount)}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                <ShieldCheck size={13} /> Liquidação Instantânea D+0
              </span>
            </div>
          </div>

          {/* Copia e Cola */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Código PIX (Copia e Cola)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={pixPayload}
                className="w-full text-xs font-mono px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition shrink-0 inline-flex items-center gap-1.5"
              >
                {copied ? (
                  <Check size={14} className="text-emerald-400" />
                ) : (
                  <Copy size={14} />
                )}
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition inline-flex items-center gap-1.5"
            >
              <Printer size={13} /> Imprimir Fatura
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePixModal;
