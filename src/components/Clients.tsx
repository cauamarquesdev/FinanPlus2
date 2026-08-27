import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  UserCheck,
  TrendingUp,
  Trash2,
  Edit2,
  DollarSign,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Client } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal / Gaveta de Cadastro
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Modal de Lançamento Rápido de Receita
  const [revenueClient, setRevenueClient] = useState<Client | null>(null);
  const [quickAmount, setQuickAmount] = useState("");
  const [quickDesc, setQuickDesc] = useState("");
  const [quickDate, setQuickDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Campos do Formulário de Cliente
  const [companyName, setCompanyName] = useState("");
  const [clientType, setClientType] = useState("Corporativo");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "pending">(
    "active",
  );

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  const loadClients = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClients(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const openNewClientModal = () => {
    setEditingClient(null);
    setCompanyName("");
    setClientType("Corporativo");
    setContactName("");
    setEmail("");
    setPhone("");
    setStatus("active");
    setIsDrawerOpen(true);
  };

  const openEditClientModal = (client: Client) => {
    setEditingClient(client);
    setCompanyName(client.company_name);
    setClientType(client.type || "Corporativo");
    setContactName(client.contact || "");
    setEmail(client.email || "");
    setPhone(client.phone || "");
    setStatus((client.status as any) || "active");
    setIsDrawerOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      alert("Informe a razão social ou nome do cliente.");
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();
      const payload = {
        company_name: companyName.trim(),
        type: clientType,
        contact: contactName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        status,
      };

      const url = editingClient
        ? `${API_URL}/clients/${editingClient.id}`
        : `${API_URL}/clients`;

      const method = editingClient ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar cliente.");

      setIsDrawerOpen(false);
      await loadClients();
    } catch (err) {
      console.error("Erro ao salvar cliente:", err);
      alert("Não foi possível salvar os dados do cliente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: number | string) => {
    if (
      !confirm(
        "Deseja realmente remover este cliente e seu histórico associado?",
      )
    )
      return;
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/clients/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await loadClients();
      }
    } catch (err) {
      console.error("Erro ao remover cliente:", err);
    }
  };

  const handleQuickRevenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revenueClient) return;

    const rawVal =
      parseFloat(quickAmount.replace(/\./g, "").replace(",", ".")) || 0;
    if (rawVal <= 0) {
      alert("Informe um montante válido.");
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();
      const payload = {
        type: "income",
        payer: "client",
        description: quickDesc || `Faturamento - ${revenueClient.company_name}`,
        amount: rawVal,
        transaction_date: quickDate,
        client_id: revenueClient.id,
      };

      const res = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        window.dispatchEvent(new Event("transactions_updated"));
        alert(
          `Receita de R$ ${rawVal.toFixed(2)} vinculada a ${revenueClient.company_name} com sucesso!`,
        );
        setRevenueClient(null);
        setQuickAmount("");
        setQuickDesc("");
      }
    } catch (err) {
      console.error("Erro no lançamento rápido:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchText =
        (c.company_name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (c.contact || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchText && matchStatus;
    });
  }, [clients, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header com KPIs de Carteira */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Users size={16} className="text-slate-700" />
            Gestão de Contas & Clientes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro de tomadores de serviço, histórico de contratos e
            faturamento direto
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadClients}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            type="button"
            onClick={openNewClientModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-xs"
          >
            <Plus size={14} /> Novo Cliente
          </button>
        </div>
      </div>

      {/* Cards de Métricas da Carteira */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">
              Total de Clientes
            </span>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {clients.length}
            </p>
          </div>
          <Building2 className="text-slate-400 h-8 w-8" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">
              Contas Ativas
            </span>
            <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">
              {clients.filter((c) => c.status === "active" || !c.status).length}
            </p>
          </div>
          <UserCheck className="text-emerald-500 h-8 w-8" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">
              Segmentação Corporativa
            </span>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
              100% B2B
            </p>
          </div>
          <TrendingUp className="text-slate-400 h-8 w-8" />
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="relative flex-1 max-w-md">
            <Search
              size={14}
              className="absolute left-3 top-2.5 text-slate-400"
            />
            <input
              type="text"
              placeholder="Buscar por razão social, contato ou e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Apenas Ativos</option>
              <option value="pending">Em Análise / Pendente</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>

        {/* Grid de Cards de Clientes */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Nenhum cliente encontrado com os filtros selecionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-slate-50/50 hover:bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl p-4 transition-all shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">
                      {client.company_name}
                    </h3>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                      {client.type || "Corporativo"}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      client.status === "inactive"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : client.status === "pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {client.status === "inactive"
                      ? "Inativo"
                      : client.status === "pending"
                        ? "Pendente"
                        : "Ativo"}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1">
                  {client.contact && (
                    <div className="flex items-center gap-1.5">
                      <UserCheck size={12} className="text-slate-400" />
                      <span>{client.contact}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail size={12} className="text-slate-400" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} className="text-slate-400" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setRevenueClient(client);
                      setQuickDesc(`Faturamento - ${client.company_name}`);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 transition"
                  >
                    <ArrowUpRight size={13} /> Lançar Receita
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditClientModal(client)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 transition"
                      title="Editar"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClient(client.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                      title="Excluir"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal / Gaveta de Cadastro e Edição */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {editingClient
                  ? "Atualizar Dados do Cliente"
                  : "Novo Cadastro de Cliente"}
              </h3>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Razão Social / Nome da Entidade *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Alpha Serviços Tecnológicos Ltda"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Segmento
                  </label>
                  <select
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Corporativo">Corporativo</option>
                    <option value="Varejo">Varejo</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Indústria">Indústria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="active">Ativo</option>
                    <option value="pending">Pendente</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Pessoa de Contato / Responsável
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo (Diretor Financeiro)"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="financeiro@empresa.com"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition disabled:opacity-50"
                >
                  {submitting
                    ? "Salvando..."
                    : editingClient
                      ? "Atualizar Cadastro"
                      : "Cadastrar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Lançamento Rápido de Receita */}
      {revenueClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Lançar Faturamento / Receita
                </h3>
                <p className="text-[11px] text-slate-500">
                  {revenueClient.company_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRevenueClient(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleQuickRevenueSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  value={quickDesc}
                  onChange={(e) => setQuickDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0,00"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    value={quickDate}
                    onChange={(e) => setQuickDate(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting ? "Processando..." : "Confirmar Recebimento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
