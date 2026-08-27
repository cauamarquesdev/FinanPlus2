import React, { useEffect, useState } from "react";
import { Search, ArrowRight, Zap, PieChart, Users, X } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: "dashboard" | "clients" | "reports" | "settings") => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        isOpen ? onClose() : void 0;
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: "dash",
      label: "Ir para Dashboard & Indicadores",
      category: "Navegação",
      icon: Zap,
      run: () => {
        onNavigate("dashboard");
        onClose();
      },
    },
    {
      id: "clients",
      label: "Gerenciar Carteira de Clientes",
      category: "Navegação",
      icon: Users,
      run: () => {
        onNavigate("clients");
        onClose();
      },
    },
    {
      id: "reports",
      label: "Abrir Demonstrativos & Balancetes",
      category: "Navegação",
      icon: PieChart,
      run: () => {
        onNavigate("reports");
        onClose();
      },
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.label.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite um comando ou atalho (Ex: Relatórios, Clientes)..."
            className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-500 font-sans"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-400 rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Nenhuma ação encontrada.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.run}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/70 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-800 text-emerald-400 border border-slate-700">
                      <Icon size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors block">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-slate-600 group-hover:text-slate-300 transition-colors"
                  />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
