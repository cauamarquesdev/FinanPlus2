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
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

interface LoginProps {
  onLogin: (user: User) => void;
}

type AuthMode = "login" | "register";

const Login = ({ onLogin }: LoginProps) => {
  const [mode, setMode] = useState<AuthMode>("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  /*
   * ==========================================
   * LIMPAR MENSAGENS
   * ==========================================
   */

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  /*
   * ==========================================
   * TROCAR ENTRE LOGIN E CADASTRO
   * ==========================================
   */

  const changeMode = (newMode: AuthMode) => {
    setMode(newMode);

    setName("");
    setEmail("");
    setPassword("");

    setShowPassword(false);

    clearMessages();
  };

  /*
   * ==========================================
   * SALVAR SESSÃO
   * ==========================================
   */

  const saveSession = (token: string, user: User) => {
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

  /*
   * ==========================================
   * LOGIN
   * ==========================================
   */

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      clearMessages();

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      let data: Partial<AuthResponse>;

      try {
        data = await response.json();
      } catch {
        throw new Error("O servidor retornou uma resposta inválida.");
      }

      if (!response.ok) {
        throw new Error(data.message || "E-mail ou senha inválidos.");
      }

      if (!data.token || !data.user) {
        throw new Error(
          "Resposta inválida do servidor. Token ou usuário não encontrado.",
        );
      }

      saveSession(data.token, data.user);

      onLogin(data.user);
    } catch (error) {
      console.error("Erro ao fazer login:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Erro ao fazer login. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==========================================
   * CADASTRO
   * ==========================================
   */

  const handleRegister = async () => {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password) {
      setError("Preencha nome, e-mail e senha.");
      return;
    }

    if (normalizedName.length < 2) {
      setError("Digite um nome válido.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);
      clearMessages();

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        throw new Error("O servidor retornou uma resposta inválida.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Não foi possível criar sua conta.");
      }

      if (!data.token || !data.user) {
        throw new Error("Conta criada, mas o servidor não retornou a sessão.");
      }

      /*
       * Salva automaticamente o usuário
       * e entra no sistema.
       */

      saveSession(data.token, data.user);

      setSuccess("Conta criada com sucesso!");

      onLogin(data.user);
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Erro ao criar sua conta. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==========================================
   * SUBMIT
   * ==========================================
   */

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (mode === "login") {
      await handleLogin();
    } else {
      await handleRegister();
    }
  };

  /*
   * ==========================================
   * ESQUECEU A SENHA
   * ==========================================
   */

  const handleForgotPassword = () => {
    setError("A recuperação de senha ainda não está disponível.");
  };

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        {/* ========================================== */}
        {/* CABEÇALHO */}
        {/* ========================================== */}

        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">FinanPlus</h1>

          <p className="mt-2 text-sm text-gray-600">
            Sistema de Gestão Financeira
          </p>

          <h2 className="mt-6 text-xl font-semibold text-gray-800">
            {mode === "login" ? "Bem-vindo de volta!" : "Crie sua conta"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {mode === "login"
              ? "Entre para acessar seu painel financeiro."
              : "Comece a organizar suas finanças."}
          </p>
        </div>

        {/* ========================================== */}
        {/* FORMULÁRIO */}
        {/* ========================================== */}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* ========================================== */}
          {/* ERRO */}
          {/* ========================================== */}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />

              <span>{error}</span>
            </div>
          )}

          {/* ========================================== */}
          {/* SUCESSO */}
          {/* ========================================== */}

          {success && (
            <div
              role="status"
              className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
            >
              {success}
            </div>
          )}

          {/* ========================================== */}
          {/* NOME - SOMENTE CADASTRO */}
          {/* ========================================== */}

          {mode === "register" && (
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nome
              </label>

              <div className="relative mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    clearMessages();
                  }}
                  placeholder="Seu nome"
                  disabled={loading}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 pl-10 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                <User
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* E-MAIL */}
          {/* ========================================== */}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              E-mail
            </label>

            <div className="relative mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearMessages();
                }}
                placeholder="seu@email.com"
                disabled={loading}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 pl-10 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              <Mail
                aria-hidden="true"
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* ========================================== */}
          {/* SENHA */}
          {/* ========================================== */}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha
            </label>

            <div className="relative mt-1">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                required
                minLength={6}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearMessages();
                }}
                placeholder="••••••••"
                disabled={loading}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 pl-10 pr-10 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              <Lock
                aria-hidden="true"
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                disabled={loading}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {mode === "register" && (
              <p className="mt-1 text-xs text-gray-500">
                A senha deve ter pelo menos 6 caracteres.
              </p>
            )}
          </div>

          {/* ========================================== */}
          {/* LEMBRAR-ME / ESQUECI */}
          {/* ========================================== */}

          {mode === "login" && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label
                htmlFor="remember-me"
                className="flex cursor-pointer items-center"
              >
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                <span className="ml-2 text-sm text-gray-900">Lembrar-me</span>
              </label>

              <button
                type="button"
                disabled={loading}
                onClick={handleForgotPassword}
                className="text-left text-sm font-medium text-blue-600 transition hover:text-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:text-right"
              >
                Esqueceu sua senha?
              </button>
            </div>
          )}

          {/* ========================================== */}
          {/* BOTÃO PRINCIPAL */}
          {/* ========================================== */}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              "Aguarde..."
            ) : mode === "login" ? (
              "Entrar"
            ) : (
              <>
                <UserPlus size={18} />
                Criar conta
              </>
            )}
          </button>

          {/* ========================================== */}
          {/* ALTERNAR LOGIN / CADASTRO */}
          {/* ========================================== */}

          <div className="text-center">
            {mode === "login" ? (
              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => changeMode("register")}
                  className="font-medium text-blue-600 transition hover:text-blue-500 disabled:opacity-50"
                >
                  Cadastre-se
                </button>
              </p>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={() => changeMode("login")}
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-500 disabled:opacity-50"
              >
                <ArrowLeft size={16} />
                Voltar para o login
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
