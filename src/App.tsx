import React, { useState } from "react";
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
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    return !!token;
  });

  const [user, setUser] = useState<User | null>(() => {
    const savedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    setIsAuthenticated(true);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage("dashboard");
  };

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

  const getPageTitle = () => {
    switch (currentPage) {
      case "dashboard":
        return "Dashboard Financeiro";

      case "clients":
        return "Gestão de Clientes";

      case "reports":
        return "Relatórios";

      case "settings":
        return "Configurações";

      default:
        return "Dashboard Financeiro";
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* SIDEBAR */}
      <div className="w-64 bg-white shadow-md flex flex-col min-h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">FinanPlus</h1>

          <p className="text-sm text-gray-500">Gestão Financeira</p>
        </div>

        <nav className="mt-6 flex-1">
          <button
            type="button"
            onClick={() => setCurrentPage("dashboard")}
            className={`w-full flex items-center px-6 py-3 text-gray-700 text-left ${
              currentPage === "dashboard"
                ? "bg-gray-100 border-l-4 border-blue-600"
                : "hover:bg-gray-50"
            }`}
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage("clients")}
            className={`w-full flex items-center px-6 py-3 text-gray-700 text-left ${
              currentPage === "clients"
                ? "bg-gray-100 border-l-4 border-blue-600"
                : "hover:bg-gray-50"
            }`}
          >
            <Users className="h-5 w-5 mr-3" />
            Clientes
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage("reports")}
            className={`w-full flex items-center px-6 py-3 text-gray-700 text-left ${
              currentPage === "reports"
                ? "bg-gray-100 border-l-4 border-blue-600"
                : "hover:bg-gray-50"
            }`}
          >
            <PieChart className="h-5 w-5 mr-3" />
            Relatórios
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage("settings")}
            className={`w-full flex items-center px-6 py-3 text-gray-700 text-left ${
              currentPage === "settings"
                ? "bg-gray-100 border-l-4 border-blue-600"
                : "hover:bg-gray-50"
            }`}
          >
            <SettingsIcon className="h-5 w-5 mr-3" />
            Configurações
          </button>
        </nav>

        {/* USUÁRIO + LOGOUT */}
        <div className="p-6 border-t">
          {user && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user.name}
              </p>

              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sair
          </button>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 min-w-0">
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {getPageTitle()}
            </h2>
          </div>
        </header>

        <main>{renderPage()}</main>
      </div>
    </div>
  );
}

export default App;
