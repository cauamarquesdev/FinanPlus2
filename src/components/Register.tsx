import { useState } from "react";
import { User, Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface UserData {
  id: number;
  name: string;
  email: string;
}

interface RegisterResponse {
  token: string;
  user: UserData;
  message?: string;
}

interface RegisterProps {
  onRegister: (user: UserData, token: string) => void;
  onBackToLogin: () => void;
}

const Register = ({ onRegister, onBackToLogin }: RegisterProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password || !confirmPassword) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);

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

      let data: Partial<RegisterResponse> & {
        message?: string;
      };

      try {
        data = await response.json();
      } catch {
        throw new Error("O servidor retornou uma resposta inválida.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Não foi possível criar sua conta.");
      }

      if (!data.token || !data.user) {
        throw new Error(
          "Cadastro realizado, mas o servidor não retornou a sessão.",
        );
      }

      onRegister(data.user, data.token);
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg sm:p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">FinanPlus</h1>

          <p className="mt-2 text-sm text-gray-600">
            Crie sua conta para começar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />

              <span>{error}</span>
            </div>
          )}

          {/* NOME */}

          <div>
            <label
              htmlFor="register-name"
              className="block text-sm font-medium text-gray-700"
            >
              Nome
            </label>

            <div className="relative mt-1">
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => {
                  setName(event.target.value);

                  if (error) {
                    setError("");
                  }
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

          {/* EMAIL */}

          <div>
            <label
              htmlFor="register-email"
              className="block text-sm font-medium text-gray-700"
            >
              E-mail
            </label>

            <div className="relative mt-1">
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);

                  if (error) {
                    setError("");
                  }
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

          {/* SENHA */}

          <div>
            <label
              htmlFor="register-password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha
            </label>

            <div className="relative mt-1">
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Mínimo de 6 caracteres"
                disabled={loading}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 pl-10 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              <Lock
                aria-hidden="true"
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* CONFIRMAR SENHA */}

          <div>
            <label
              htmlFor="register-confirm-password"
              className="block text-sm font-medium text-gray-700"
            >
              Confirmar senha
            </label>

            <div className="relative mt-1">
              <input
                id="register-confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Digite a senha novamente"
                disabled={loading}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 pl-10 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              <Lock
                aria-hidden="true"
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* CADASTRAR */}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>

          {/* VOLTAR */}

          <button
            type="button"
            onClick={onBackToLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 text-sm font-medium text-gray-600 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft size={16} />
            Já tenho uma conta
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
