import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Login from './components/Login';
import { LayoutDashboard, Users, PieChart, Settings as SettingsIcon, LogOut } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogin = (email: string, password: string) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <Clients />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard Financeiro';
      case 'clients':
        return 'Gestão de Clientes';
      case 'reports':
        return 'Relatórios';
      case 'settings':
        return 'Configurações';
      default:
        return 'Dashboard Financeiro';
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">FinanPlus</h1>
          <p className="text-sm text-gray-500">Gestão Financeira</p>
        </div>
        <nav className="mt-6">
          <a
            href="#"
            onClick={() => setCurrentPage('dashboard')}
            className={`flex items-center px-6 py-3 text-gray-700 ${
              currentPage === 'dashboard' ? 'bg-gray-100 border-l-4 border-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </a>
          <a
            href="#"
            onClick={() => setCurrentPage('clients')}
            className={`flex items-center px-6 py-3 text-gray-700 ${
              currentPage === 'clients' ? 'bg-gray-100 border-l-4 border-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            <Users className="h-5 w-5 mr-3" />
            Clientes
          </a>
          <a
            href="#"
            onClick={() => setCurrentPage('reports')}
            className={`flex items-center px-6 py-3 text-gray-700 ${
              currentPage === 'reports' ? 'bg-gray-100 border-l-4 border-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            <PieChart className="h-5 w-5 mr-3" />
            Relatórios
          </a>
          <a
            href="#"
            onClick={() => setCurrentPage('settings')}
            className={`flex items-center px-6 py-3 text-gray-700 ${
              currentPage === 'settings' ? 'bg-gray-100 border-l-4 border-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            <SettingsIcon className="h-5 w-5 mr-3" />
            Configurações
          </a>
        </nav>
        <div className="absolute bottom-0 w-64 p-6">
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
          </div>
        </header>

        <main>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;