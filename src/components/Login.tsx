import { useState } from "react";
import {
  Mail,
  Lock,
  AlertCircle,
  User,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface UserData {
  id: number;
  name: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: UserData;
  message?: string;
}

interface LoginProps {
  onLogin: (user: UserData) => void;
}

type AuthMode = "login" | "register";

export const Login = ({ onLogin }: LoginProps) => {
  const [mode, setMode] = useState<AuthMode>("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const changeMode = (newMode: AuthMode) => {
    setMode(newMode);
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    clearMessages();
  };

  const saveSession = (token: string, user: UserData) => {
    if (rememberMe) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    } else {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      clearMessages();

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      let data: Partial<AuthResponse>;
      try {
        data = await response.json();
      } catch {
        throw new Error("O servidor retornou uma resposta inválida.");
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Credenciais inválidas. Verifique os dados.",
        );
      }

      if (!data.token || !data.user) {
        throw new Error("Token de autenticação não retornado.");
      }

      saveSession(data.token, data.user);
      onLogin(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao efetuar login.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password) {
      setError("Todos os campos cadastrais são obrigatórios.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve conter no mínimo 6 caracteres.");
      return;
    }

    try {
      setLoading(true);
      clearMessages();

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: normalizedName,
          email: normalizedEmail,
          password,
        }),
      });

      let data: Partial<AuthResponse>;
      try {
        data = await response.json();
      } catch {
        throw new Error("Resposta inesperada do servidor.");
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Não foi possível concluir o registro.",
        );
      }

      if (!data.token || !data.user) {
        throw new Error("Sessão criada sem credenciais de autenticação.");
      }

      saveSession(data.token, data.user);
      setSuccess("Conta criada com sucesso!");
      onLogin(data.user);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Falha ao registrar conta.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    if (mode === "login") {
      await handleLogin();
    } else {
      await handleRegister();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 antialiased text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="h-10 w-10 mx-auto rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-lg shadow-sm">
            FP
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            FinanPlus Enterprise
          </h1>
          <p className="text-xs text-slate-400">
            {mode === "login"
              ? "Acesse o painel financeiro consolidado"
              : "Cadastre seu operador para iniciar"}
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg border border-rose-900/50 bg-rose-950/40 text-rose-300 text-xs">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg border border-emerald-900/50 bg-emerald-950/40 text-emerald-300 text-xs">
            <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nome do Operador
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={15}
                />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearMessages();
                  }}
                  placeholder="Nome completo"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              E-mail Corporativo
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={15}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearMessages();
                }}
                placeholder="operador@empresa.com"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={15}
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearMessages();
                }}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {mode === "login" && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0"
                />
                <span>Manter conectado</span>
              </label>

              <button
                type="button"
                onClick={() =>
                  setError("Contate o administrador para redefinição de chave.")
                }
                className="hover:text-slate-200 transition"
              >
                Esqueceu a senha?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {loading
              ? "Autenticando..."
              : mode === "login"
                ? "Acessar Plataforma"
                : "Criar Acesso"}
          </button>

          <div className="text-center pt-2">
            {mode === "login" ? (
              <p className="text-xs text-slate-400">
                Novo por aqui?{" "}
                <button
                  type="button"
                  onClick={() => changeMode("register")}
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition"
                >
                  Criar conta
                </button>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => changeMode("login")}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                <ArrowLeft size={13} />
                Voltar ao login
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
