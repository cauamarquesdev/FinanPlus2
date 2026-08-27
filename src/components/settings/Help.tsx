import React, { useState } from "react";
import {
  Book,
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  CheckCircle2,
  Send,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "Como funciona a conciliação e exportação de relatórios?",
    answer:
      "Os relatórios podem ser gerados em planilhas Excel (.xlsx) ou extraídos em formato tabular (.csv) através dos botões de exportação localizados no topo das telas de Relatórios e Dashboard.",
  },
  {
    question: "Qual a lógica de diferenciação entre pagador Cliente e Usuário?",
    answer:
      "Transações do tipo Receita requerem que o pagador seja o Cliente (entrada de recursos). Já transações do tipo Despesa são desembolsadas pela empresa/usuário, assegurando a integridade do DRE.",
  },
  {
    question: "Como funciona o motor de inteligência e diagnóstico financeiro?",
    answer:
      "Nossos serviços analisam a série histórica dos últimos 6 meses computando margem bruta, centros de maior despesa e concentração de receita para sugerir correções de fluxo de caixa.",
  },
  {
    question:
      "Como revogar o acesso de sessões abertas em outros dispositivos?",
    answer:
      'Na aba Segurança, na listagem de Sessões Ativas, clique no botão "Encerrar" do dispositivo desejado para invalidar o token de autenticação.',
  },
];

export const Help: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [ticketSent, setTicketSent] = useState(false);

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setTicketSent(true);
    setSubject("");
    setMessage("");
    setTimeout(() => setTicketSent(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Quick Action Cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
          Canais de Suporte & Base de Conhecimento
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Acesse documentações técnicas ou abra um chamado direto
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-400 transition-colors cursor-pointer shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-800">
                <Book className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">
                  Documentação da API & Guias
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Consulte guias passo a passo de conciliação bancária e
                  integração de ERP
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-400 transition-colors cursor-pointer shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-800">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">
                  Atendimento Dedicado
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Fale com um especialista financeiro em horário comercial (09h
                  às 18h)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion FAQ */}
      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
          Dúvidas Frequentes (FAQ)
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Respostas rápidas para as principais dúvidas da plataforma
        </p>

        <div className="space-y-2">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-2 hover:bg-slate-50/50 transition-colors"
                >
                  <span className="text-xs font-semibold text-slate-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180 text-slate-800" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-3 pt-1 border-t border-slate-100 bg-slate-50/40">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Formulário de Chamado & Contatos */}
      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
          Abertura de Chamado Técnico
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Envie sua solicitação com tempo médio de resposta em até 2 horas
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3 md:col-span-1">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone size={13} className="text-slate-500" /> Central de
                Atendimento
              </span>
              <p className="text-xs font-mono text-slate-900">0800 3002 8922</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail size={13} className="text-slate-500" /> Desk Corporativo
              </span>
              <p className="text-xs font-mono text-slate-900">
                suporte@finanplus.com
              </p>
            </div>
          </div>

          <form onSubmit={handleSendTicket} className="md:col-span-2 space-y-3">
            {ticketSent && (
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>
                  Chamado registrado com sucesso. Número do protocolo enviado
                  por e-mail.
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Assunto / Categoria
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Dúvida na conciliação da competência 08/2026"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Memorial Descritivo do Chamado
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Descreva o comportamento observado ou sua solicitação..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-xs"
              >
                <Send size={13} />
                Enviar Chamado
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Help;
