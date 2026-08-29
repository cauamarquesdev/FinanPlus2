import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Clients from "./components/Clients";
import Reports from "./components/Reports";
import Settings from "./components/Settings";
import Login from "./components/Login";
import { TransactionsManager } from "./components/TransactionsManager";
import CashFlowForecast from "./components/CashFlowForecast";
import ProfitAnalytics from "./components/ProfitAnalytics";
import ExecutiveHub from "./components/ExecutiveHub";
import CreditAndSchedule from "./components/CreditAndSchedule";
import ProfitRecoveryEngine from "./components/ProfitRecoveryEngine";
import LeverageInvestments from "./components/LeverageInvestments";
import DebtManagement from "./components/DebtManagement";
import BillingSettings from "./components/BillingSettings";
import { User } from "./types";
import CfoCopilot from "./components/CfoCopilot";
import CommandPalette from "./components/CommandPalette";
import {
  LayoutDashboard,
  Receipt,
  Sparkles,
  Award,
  TrendingUp,
  Briefcase,
  CalendarDays,
  Users,
  PieChart,
  CreditCard,
  Settings as SettingsIcon,
  LogOut,
  Rocket,
  Scale,
  Menu,
  X,
  ChevronRight,
  Search,
} from "lucide-react";

type Page =
  | "dashboard"
  | "recovery"
  | "leverage"
  | "debt"
  | "transactions"
  | "profit"
  | "forecast"
  | "executive"
  | "credit_schedule"
  | "clients"
  | "reports"
  | "billing"
  | "settings";

const getStoredItem = (key: string): string | null => {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
};

const getStoredUser = (): User | null => {
  const savedUser = getStoredItem("user");
  if (!savedUser) return null;
  try {
    return JSON.parse(savedUser) as User;
  } catch {
    return null;
  }
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    Boolean(getStoredItem("token")),
  );
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    setIsAuthenticated(true);
    setCurrentPage("dashboard");
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage("dashboard");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "recovery", label: "Lucro Oculto & Tesouraria", icon: Sparkles },
    { id: "leverage", label: "Alavancagem & Investimentos", icon: Rocket },
    { id: "debt", label: "Endividamento & Passivos", icon: Scale },
    { id: "transactions", label: "Lançamentos", icon: Receipt },
    { id: "profit", label: "Lucratividade & EBITDA", icon: Award },
    { id: "forecast", label: "Previsão & Forecast", icon: TrendingUp },
    { id: "executive", label: "Executive Deck (PDF)", icon: Briefcase },
    { id: "credit_schedule", label: "Score & Liquidez", icon: CalendarDays },
    { id: "clients", label: "Clientes", icon: Users },
    { id: "reports", label: "Relatórios & DRE", icon: PieChart },
    { id: "billing", label: "Minha Assinatura", icon: CreditCard },
    { id: "settings", label: "Configurações", icon: SettingsIcon },
  ] as const;

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased">
      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        onNavigate={(page) => setCurrentPage(page as Page)}
      />

      {sidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Fechar menu"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between bg-slate-900 border-r border-slate-800 transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-sm">
                FP
              </div>
              <div>
                <span className="text-sm font-semibold tracking-tight text-white block leading-tight">
                  FinanPlus
                </span>
                <span className="text-[10px] font-medium uppercase text-slate-400">
                  Enterprise Core
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-slate-400 lg:hidden cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-3">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                const isSpecial =
                  item.id === "recovery" || item.id === "leverage";
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCurrentPage(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? "bg-slate-800 text-white font-semibold"
                        : isSpecial
                          ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive
                          ? "text-emerald-400"
                          : isSpecial
                            ? "text-emerald-400 animate-pulse"
                            : "text-slate-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-3 border-t border-slate-800 space-y-2">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-950/40 border border-slate-800">
              <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 rounded-lg transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs print:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <div>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <span>FinanPlus</span>
                <ChevronRight size={12} />
                <span className="text-slate-600 capitalize">{currentPage}</span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {currentPage === "dashboard" && "Visão Geral & Stress Testing"}
                {currentPage === "recovery" &&
                  "Otimizador de Lucro Oculto & Piloto de Tesouraria"}
                {currentPage === "leverage" &&
                  "Alavancagem Financeira & Investimentos"}
                {currentPage === "debt" && "Gestão de Endividamento & Passivos"}
                {currentPage === "transactions" &&
                  "Gestão de Lançamentos & Provisões"}
                {currentPage === "profit" &&
                  "Análise de Lucratividade & EBITDA"}
                {currentPage === "forecast" &&
                  "Previsão de Caixa & Scenario Planning"}
                {currentPage === "executive" &&
                  "Executive Deck & Matriz de Decisões"}
                {currentPage === "credit_schedule" &&
                  "Score de Crédito & Liquidez Diária"}
                {currentPage === "clients" && "Gestão de Clientes"}
                {currentPage === "reports" && "Relatórios e Balancetes"}
                {currentPage === "billing" && "Minha Assinatura"}
                {currentPage === "settings" && "Configurações"}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs transition cursor-pointer"
          >
            <Search size={14} />
            <span className="hidden sm:inline">Buscar ou executar ação...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 text-slate-600 rounded">
              Ctrl+K
            </kbd>
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto overflow-y-auto print:p-0 print:max-w-none">
          {currentPage === "dashboard" && <Dashboard />}
          {currentPage === "recovery" && <ProfitRecoveryEngine />}
          {currentPage === "leverage" && <LeverageInvestments />}
          {currentPage === "debt" && <DebtManagement />}
          {currentPage === "transactions" && <TransactionsManager />}
          {currentPage === "profit" && <ProfitAnalytics />}
          {currentPage === "forecast" && <CashFlowForecast />}
          {currentPage === "executive" && <ExecutiveHub />}
          {currentPage === "credit_schedule" && <CreditAndSchedule />}
          {currentPage === "clients" && <Clients />}
          {currentPage === "reports" && <Reports />}
          {currentPage === "billing" && <BillingSettings />}
          {currentPage === "settings" && <Settings />}
        </main>
      </div>

      {/* CFO Copilot IA Widget */}
      <CfoCopilot />
    </div>
  );
}

export default App;
