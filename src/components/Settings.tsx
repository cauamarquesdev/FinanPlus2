import { useState } from "react";
import {
  User,
  Building2,
  Bell,
  Lock,
  CreditCard,
  HelpCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import Company from "./settings/Company";
import Notifications from "./settings/Notifications";
import Security from "./settings/Security";
import Payment from "./settings/Payment";
import Help from "./settings/Help";

type SettingSection =
  | "profile"
  | "company"
  | "notifications"
  | "security"
  | "payment"
  | "help";

export const Settings = () => {
  const [currentSection, setCurrentSection] =
    useState<SettingSection>("profile");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "Administrador Financeiro",
    email: "admin@empresa.com",
    phone: "(34) 99822-1020",
    role: "Diretor Financeiro (CFO)",
    emailAlerts: true,
    monthlyDigest: true,
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const navTabs = [
    { id: "profile", label: "Meu Perfil", icon: User },
    { id: "company", label: "Dados da Empresa", icon: Building2 },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "security", label: "Segurança & Sessões", icon: Lock },
    { id: "payment", label: "Faturamento & Plano", icon: CreditCard },
    { id: "help", label: "Suporte & Ajuda", icon: HelpCircle },
  ] as const;

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
      case "profile":
      default:
        return (
          <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-2xl">
            {savedSuccess && (
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>Preferências salvas com sucesso no banco de dados.</span>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
                Informações Pessoais
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Atualize suas credenciais de operador do sistema
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    E-mail Corporativo
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Telefone / Contato
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Cargo / Responsabilidade
                  </label>
                  <input
                    type="text"
                    value={profileData.role}
                    onChange={(e) =>
                      setProfileData({ ...profileData, role: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
                Preferências de Despacho
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Defina quais relatórios devem ser disparados para seu endereço
              </p>

              <div className="space-y-3">
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.emailAlerts}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        emailAlerts: e.target.checked,
                      })
                    }
                    className="rounded text-slate-900 focus:ring-0"
                  />
                  <span>
                    Alertas em tempo real de transações anômalas ou de alto
                    valor
                  </span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.monthlyDigest}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        monthlyDigest: e.target.checked,
                      })
                    }
                    className="rounded text-slate-900 focus:ring-0"
                  />
                  <span>
                    Demonstrativo consolidado mensal automático em PDF
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-xs"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          Parâmetros do Sistema
        </h2>
        <p className="text-xs text-slate-500">
          Ajuste regras de faturamento, credenciais e integrações corporativas
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4">
          <aside className="p-4 border-r border-slate-100 bg-slate-50/50">
            <nav className="space-y-1">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCurrentSection(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      isActive
                        ? "bg-slate-900 text-white font-semibold shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon
                      size={14}
                      className={
                        isActive ? "text-emerald-400" : "text-slate-400"
                      }
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="p-6 col-span-3">{renderSection()}</main>
        </div>
      </div>
    </div>
  );
};

export default Settings;
