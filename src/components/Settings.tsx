import { useState } from "react";
import {
  User,
  Building,
  Bell,
  Lock,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import Company from "./settings/Company";
import Notifications from "./settings/Notifications";
import Security from "./settings/Security";
import Payment from "./settings/Payment";
import Help from "./settings/Help";

const Settings = () => {
  const [currentSection, setCurrentSection] = useState("profile");

  const renderSection = () => {
    switch (currentSection) {
      case "company":
        return <Company />;
      case "notifications":
        return <Notifications />;
      case "security":
        return <Security />;
      case "payment":
        return <Payment />;
      case "help":
        return <Help />;
      default:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informações do Perfil
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border- gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Seu cargo"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Preferências
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="emailNotifications"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Receber notificações por e-mail
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="monthlyReport"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="monthlyReport"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Relatório mensal automático
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Salvar Alterações
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>

      <div className="bg-white rounded-xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4">
          <div className="p-6 border-r border-gray-200">
            <nav className="space-y-2">
              <a
                href="#"
                onClick={() => setCurrentSection("profile")}
                className={`flex items-center px-4 py-2 text-gray-600 ${
                  currentSection === "profile"
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-50"
                } rounded-lg`}
              >
                <User className="h-5 w-5 mr-3" />
                Perfil
              </a>
              <a
                href="#"
                onClick={() => setCurrentSection("company")}
                className={`flex items-center px-4 py-2 text-gray-600 ${
                  currentSection === "company"
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-50"
                } rounded-lg`}
              >
                <Building className="h-5 w-5 mr-3" />
                Empresa
              </a>
              <a
                href="#"
                onClick={() => setCurrentSection("notifications")}
                className={`flex items-center px-4 py-2 text-gray-600 ${
                  currentSection === "notifications"
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-50"
                } rounded-lg`}
              >
                <Bell className="h-5 w-5 mr-3" />
                Notificações
              </a>
              <a
                href="#"
                onClick={() => setCurrentSection("security")}
                className={`flex items-center px-4 py-2 text-gray-600 ${
                  currentSection === "security"
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-50"
                } rounded-lg`}
              >
                <Lock className="h-5 w-5 mr-3" />
                Segurança
              </a>
              <a
                href="#"
                onClick={() => setCurrentSection("payment")}
                className={`flex items-center px-4 py-2 text-gray-600 ${
                  currentSection === "payment"
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-50"
                } rounded-lg`}
              >
                <CreditCard className="h-5 w-5 mr-3" />
                Pagamento
              </a>
              <a
                href="#"
                onClick={() => setCurrentSection("help")}
                className={`flex items-center px-4 py-2 text-gray-600 ${
                  currentSection === "help"
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-50"
                } rounded-lg`}
              >
                <HelpCircle className="h-5 w-5 mr-3" />
                Ajuda
              </a>
            </nav>
          </div>

          <div className="p-6 col-span-3">{renderSection()}</div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
