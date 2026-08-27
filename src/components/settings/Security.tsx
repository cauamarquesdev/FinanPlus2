import React, { useState } from "react";
import {
  Shield,
  Key,
  Smartphone,
  History,
  CheckCircle2,
  X,
  AlertTriangle,
} from "lucide-react";

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export const Security: React.FC = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: "1",
      device: "Google Chrome • Windows 11",
      location: "São Paulo, Brasil",
      lastActive: "Ativo agora",
      isCurrent: true,
    },
    {
      id: "2",
      device: "Safari • Apple iPhone 15",
      location: "São Paulo, Brasil",
      lastActive: "2 horas atrás",
      isCurrent: false,
    },
    {
      id: "3",
      device: "Firefox • Linux Ubuntu",
      location: "Belo Horizonte, Brasil",
      lastActive: "3 dias atrás",
      isCurrent: false,
    },
  ]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("As senhas não conferem.");
      return;
    }

    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setFeedback("Senha de acesso alterada com sucesso.");
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleTerminateSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setFeedback("Sessão remota encerrada com sucesso.");
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {feedback && (
        <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Camadas de Autenticação */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
          Credenciais & Autenticação
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Gerencie regras de proteção de acesso e fatores adicionais
        </p>

        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                <Key size={18} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">
                  Chave de Acesso (Senha)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Última renovação de credencial efetuada há 3 meses
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Alterar Senha
            </button>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                <Smartphone size={18} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">
                  Autenticação em Dois Fatores (2FA)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Exige código temporário (TOTP) no login corporativo
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                twoFactorEnabled
                  ? "bg-slate-900 justify-end"
                  : "bg-slate-200 justify-start"
              }`}
            >
              <div className="h-4 w-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* Sessões Concorrentes */}
      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
          Sessões Ativas no Sistema
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Dispositivos com tokens de acesso válidos
        </p>

        <div className="space-y-2.5">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Shield
                  size={18}
                  className={
                    s.isCurrent ? "text-emerald-600" : "text-slate-400"
                  }
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-slate-900">
                      {s.device}
                    </h4>
                    {s.isCurrent && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded border border-emerald-200/50">
                        Dispositivo Atual
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {s.location} • {s.lastActive}
                  </p>
                </div>
              </div>

              {!s.isCurrent && (
                <button
                  type="button"
                  onClick={() => handleTerminateSession(s.id)}
                  className="text-xs font-medium text-rose-600 hover:text-rose-800 transition"
                >
                  Encerrar
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Histórico de Auditoria */}
      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
          Trilha de Auditoria de Segurança
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Registros das últimas ações sensíveis na conta
        </p>

        <div className="space-y-2">
          {[
            {
              action: "Login bem-sucedido via credencial JWT",
              date: "27/08/2026 14:30",
              ip: "177.136.20.14",
            },
            {
              action: "Exportação de balancete contábil em XLS",
              date: "26/08/2026 11:15",
              ip: "177.136.20.14",
            },
            {
              action: "Sessão revogada em dispositivo remoto",
              date: "22/08/2026 09:40",
              ip: "189.40.112.05",
            },
          ].map((log, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100"
            >
              <div className="flex items-center gap-2">
                <History size={14} className="text-slate-400" />
                <span className="font-medium text-slate-800">{log.action}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {log.date} • {log.ip}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal - Alterar Senha */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Renovação de Senha
              </h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Senha Atual
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 dígitos"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
                >
                  Atualizar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;
