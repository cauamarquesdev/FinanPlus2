import { useState } from "react";

import Dashboard from "./components/Dashboard";
import Clients from "./components/Clients";
import Reports from "./components/Reports";
import Settings from "./components/Settings";
import Login from "./components/Login";

import {
  LayoutDashboard,
  Users,
  PieChart,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
}

type Page = "dashboard" | "clients" | "reports" | "settings";

/*
 * ==========================================
 * STORAGE
 * ==========================================
 */

const getStoredItem = (key: string): string | null => {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
};

const getStoredUser = (): User | null => {
  const savedUser = getStoredItem("user");

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser) as User;
  } catch (error) {
    console.error("Erro ao recuperar usuário:", error);

    // Remove dados corrompidos
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    return null;
  }
};

/*
 * ==========================================
 * APP
 * ==========================================
 */

function App() {
  /*
   * ==========================================
   * AUTENTICAÇÃO
   * ==========================================
   */

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = getStoredItem("token");

    return Boolean(token);
  });

  const [user, setUser] = useState<User | null>(() => getStoredUser());

  /*
   * ==========================================
   * NAVEGAÇÃO
   * ==========================================
   */

  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /*
   * ==========================================
   * LOGIN
   * ==========================================
   */

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    setIsAuthenticated(true);
    setCurrentPage("dashboard");
    setSidebarOpen(false);
  };

  /*
   * ==========================================
   * LOGOUT
   * ==========================================
   */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage("dashboard");
    setSidebarOpen(false);
  };

  /*
   * ==========================================
   * NAVEGAÇÃO
   * ==========================================
   */

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  /*
   * ==========================================
   * TÍTULO DA PÁGINA
   * ==========================================
   */

  const getPageTitle = (): string => {
    const titles: Record<Page, string> = {
      dashboard: "Dashboard Financeiro",
      clients: "Gestão de Clientes",
      reports: "Relatórios",
      settings: "Configurações",
    };

    return titles[currentPage];
  };

  /*
   * ==========================================
   * RENDERIZAÇÃO DAS PÁGINAS
   * ==========================================
   */

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;

      case "clients":
        return <Clients />;

      case "reports":
        return <Reports />;

      case "settings":
        return <Settings />;

      default:
        return <Dashboard />;
    }
  };

  /*
   * ==========================================
   * NÃO AUTENTICADO
   * ==========================================
   */

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  /*
   * ==========================================
   * SISTEMA
   * ==========================================
   */

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ========================================== */}
      {/* OVERLAY MOBILE */}
      {/* ========================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-black/40 lg:hidden"
        />
      )}

      {/* ========================================== */}
      {/* SIDEBAR */}
      {/* ========================================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-64
          flex-col
          bg-white
          shadow-lg
          transition-transform
          duration-300
          ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* LOGO */}

        <div className="relative border-b px-6 py-6">
          <h1 className="text-2xl font-bold text-blue-600">FinanPlus</h1>

          <p className="mt-1 text-sm text-gray-500">Gestão Financeira</p>

          {/* FECHAR MENU MOBILE */}

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="absolute right-4 top-5 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 lg:hidden"
            aria-label="Fechar menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* ========================================== */}
        {/* NAVEGAÇÃO */}
        {/* ========================================== */}

        <nav className="flex-1 overflow-y-auto py-6">
          {/* DASHBOARD */}

          <button
            type="button"
            onClick={() => handlePageChange("dashboard")}
            className={`
              flex
              w-full
              items-center
              px-6
              py-3
              text-left
              text-gray-700
              transition-colors
              ${
                currentPage === "dashboard"
                  ? "border-l-4 border-blue-600 bg-blue-50 text-blue-700"
                  : "border-l-4 border-transparent hover:bg-gray-50"
              }
            `}
          >
            <LayoutDashboard className="mr-3 h-5 w-5 flex-shrink-0" />

            <span>Dashboard</span>
          </button>

          {/* CLIENTES */}

          <button
            type="button"
            onClick={() => handlePageChange("clients")}
            className={`
              flex
              w-full
              items-center
              px-6
              py-3
              text-left
              text-gray-700
              transition-colors
              ${
                currentPage === "clients"
                  ? "border-l-4 border-blue-600 bg-blue-50 text-blue-700"
                  : "border-l-4 border-transparent hover:bg-gray-50"
              }
            `}
          >
            <Users className="mr-3 h-5 w-5 flex-shrink-0" />

            <span>Clientes</span>
          </button>

          {/* RELATÓRIOS */}

          <button
            type="button"
            onClick={() => handlePageChange("reports")}
            className={`
              flex
              w-full
              items-center
              px-6
              py-3
              text-left
              text-gray-700
              transition-colors
              ${
                currentPage === "reports"
                  ? "border-l-4 border-blue-600 bg-blue-50 text-blue-700"
                  : "border-l-4 border-transparent hover:bg-gray-50"
              }
            `}
          >
            <PieChart className="mr-3 h-5 w-5 flex-shrink-0" />

            <span>Relatórios</span>
          </button>

          {/* CONFIGURAÇÕES */}

          <button
            type="button"
            onClick={() => handlePageChange("settings")}
            className={`
              flex
              w-full
              items-center
              px-6
              py-3
              text-left
              text-gray-700
              transition-colors
              ${
                currentPage === "settings"
                  ? "border-l-4 border-blue-600 bg-blue-50 text-blue-700"
                  : "border-l-4 border-transparent hover:bg-gray-50"
              }
            `}
          >
            <SettingsIcon className="mr-3 h-5 w-5 flex-shrink-0" />

            <span>Configurações</span>
          </button>
        </nav>

        {/* ========================================== */}
        {/* USUÁRIO */}
        {/* ========================================== */}

        <div className="border-t p-6">
          {user && (
            <div className="mb-5 min-w-0">
              <p
                className="truncate text-sm font-semibold text-gray-800"
                title={user.name}
              >
                {user.name}
              </p>

              <p
                className="mt-1 truncate text-xs text-gray-500"
                title={user.email}
              >
                {user.email}
              </p>
            </div>
          )}

          {/* LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center rounded-lg px-2 py-2 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="mr-3 h-5 w-5" />

            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* ========================================== */}
      {/* CONTEÚDO PRINCIPAL */}
      {/* ========================================== */}

      <div className="min-h-screen lg:ml-64">
        {/* ========================================== */}
        {/* HEADER */}
        {/* ========================================== */}

        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
          <div className="flex min-h-[72px] items-center gap-3 px-4 py-4 sm:px-6">
            {/* MENU MOBILE */}

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden"
              aria-label="Abrir menu"
              aria-expanded={sidebarOpen}
            >
              <Menu size={24} />
            </button>

            {/* TÍTULO */}

            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-gray-800 sm:text-xl">
                {getPageTitle()}
              </h2>
            </div>
          </div>
        </header>

        {/* ========================================== */}
        {/* CONTEÚDO */}
        {/* ========================================== */}

        <main className="min-w-0">{renderPage()}</main>
      </div>
    </div>
  );
}

export default App;
