import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  RefreshCw,
  Minimize2,
  Maximize2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "Se a receita oscilar +5% em 6 meses, qual será o saldo?",
  "Onde estão os maiores ralos de despesa da empresa?",
  "Qual a nossa margem líquida e o que posso fazer para otimizar?",
  "Faça um balanço geral e me dê 3 conselhos práticos.",
];

export const CfoCopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Olá! Sou seu **CFO Copilot**. Tenho acesso a todas as suas transações e balancetes em tempo real. Pode me fazer qualquer pergunta, simulação ou pedir conselhos estratégicos.",
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          conversationHistory: updatedMessages.slice(-8),
        }),
      });

      const data = await res.json();

      const botMsg: Message = {
        id: String(Date.now() + 1),
        sender: "bot",
        text: data.reply || "Não consegui formular uma resposta no momento.",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "bot",
          text: "⚠️ Falha de comunicação com o servidor. Verifique se o backend está em execução.",
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (txt: string, isUser: boolean) => {
    return txt.split("\n").map((line, lineIdx) => {
      if (line.startsWith("### ")) {
        return (
          <h4
            key={lineIdx}
            className={`font-bold mt-2 mb-1 text-xs uppercase tracking-wide ${
              isUser ? "text-white" : "text-slate-900"
            }`}
          >
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li
            key={lineIdx}
            className={`ml-3 list-disc text-[11.5px] my-0.5 ${
              isUser ? "text-slate-100" : "text-slate-700"
            }`}
          >
            {renderInlineMarkdown(line.replace("- ", ""), isUser)}
          </li>
        );
      }
      return (
        <p
          key={lineIdx}
          className={`text-[11.5px] my-1 leading-relaxed ${
            isUser ? "text-white" : "text-slate-800"
          }`}
        >
          {renderInlineMarkdown(line, isUser)}
        </p>
      );
    });
  };

  const renderInlineMarkdown = (txt: string, isUser: boolean) => {
    const parts = txt.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong
            key={i}
            className={`font-bold ${
              isUser ? "text-emerald-300 font-semibold" : "text-slate-950"
            }`}
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Botão Flutuante */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 border border-slate-700 cursor-pointer"
        >
          <div className="relative">
            <Sparkles size={17} className="text-emerald-400 animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-tight">
            CFO Copilot (IA)
          </span>
        </button>
      )}

      {/* Janela de Conversa */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col transition-all overflow-hidden ${
            isExpanded
              ? "w-[94vw] sm:w-[650px] h-[82vh]"
              : "w-[92vw] sm:w-[440px] h-[560px]"
          }`}
        >
          {/* Header */}
          <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Bot size={15} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold leading-none flex items-center gap-1.5 text-white">
                  CFO Copilot
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-normal bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    IA Ativa
                  </span>
                </h3>
                <span className="text-[10px] text-slate-400">
                  Inteligência Financeira Conversacional
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/70 text-xs">
            {messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="h-6 w-6 rounded-md bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={13} />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 shadow-2xs ${
                      isUser
                        ? "bg-slate-900 text-white rounded-br-xs"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                    }`}
                  >
                    <div>{renderFormattedText(m.text, isUser)}</div>
                    <span
                      className={`text-[9px] block mt-1.5 ${
                        isUser ? "text-slate-400 text-right" : "text-slate-400"
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                  {isUser && (
                    <div className="h-6 w-6 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <UserIcon size={12} />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-[11px] p-2 bg-white rounded-lg border border-slate-200/60 w-fit shadow-2xs">
                <RefreshCw
                  size={12}
                  className="animate-spin text-emerald-600"
                />
                <span>Digitando resposta e analisando métricas...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Atalhos Rápidos */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition shrink-0 cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Converse, simule cenários ou tire dúvidas financeiras..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl transition shadow-xs cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default CfoCopilot;
