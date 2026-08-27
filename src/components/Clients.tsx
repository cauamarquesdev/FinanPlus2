import React, { useEffect, useMemo, useState } from "react";
import {
  UserPlus,
  Search,
  Mail,
  Phone,
  Building2,
  UserCheck,
  DollarSign,
  Pencil,
  Trash2,
  X,
  Download,
  Filter,
  Users,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface Client {
  id: number;
  company_name: string;
  type: string;
  email: string;
  phone: string;
  contact: string;
  status: string;
}

interface Sector {
  id: number;
  name: string;
}

interface TransactionForm {
  client_id: number;
  sector_id: string;
  type: "income" | "expense";
  payer: "client" | "user";
  description: string;
  amount: string;
  transaction_date: string;
}

const emptyClientForm = {
  company_name: "",
  type: "Pessoa Jurídica",
  contact: "",
  email: "",
  phone: "",
  status: "active",
};

const getToday = () => new Date().toISOString().split("T")[0];

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") ||
    ""
  );
};

const getAuthHeaders = (includeContentType = false) => {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSectors, setLoadingSectors] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingClientId, setEditingClientId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [savingClient, setSavingClient] = useState(false);
  const [savingTransaction, setSavingTransaction] = useState(false);
  const [deletingClientId, setDeletingClientId] = useState<number | null>(null);

  const [formData, setFormData] = useState(emptyClientForm);
  const [transactionForm, setTransactionForm] = useState<TransactionForm>({
    client_id: 0,
    sector_id: "",
    type: "income",
    payer: "client",
    description: "",
    amount: "",
    transaction_date: getToday(),
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      if (!token)
        throw new Error("Usuário não autenticado. Faça login novamente.");

      const response = await fetch(`${API_URL}/clients`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      let data: unknown = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (response.status === 401) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "Erro ao carregar carteira de clientes.";
        throw new Error(message);
      }

      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os clientes.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSectors = async () => {
    try {
      setLoadingSectors(true);
      const token = getToken();
      if (!token) throw new Error("Usuário não autenticado.");

      const response = await fetch(`${API_URL}/sectors`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      let data: unknown = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (response.ok && Array.isArray(data)) {
        setSectors(data);
      } else {
        setSectors([]);
      }
    } catch (err) {
      console.error("Erro ao buscar setores contábeis:", err);
      setSectors([]);
    } finally {
      setLoadingSectors(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchSectors();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openNewClientModal = () => {
    setEditingClientId(null);
    setFormData({ ...emptyClientForm });
    setShowModal(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClientId(client.id);
    setFormData({
      company_name: client.company_name || "",
      type: client.type || "Pessoa Jurídica",
      contact: client.contact || "",
      email: client.email || "",
      phone: client.phone || "",
      status: client.status || "active",
    });
    setShowModal(true);
  };

  const closeClientModal = () => {
    setShowModal(false);
    setEditingClientId(null);
    setFormData({ ...emptyClientForm });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name.trim()) return;

    try {
      setSavingClient(true);
      const url = editingClientId
        ? `${API_URL}/clients/${editingClientId}`
        : `${API_URL}/clients`;
      const method = editingClientId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(true),
        body: JSON.stringify(formData),
      });

      let data: Client | { message?: string } | null = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          (data && "message" in data && data.message) ||
            (editingClientId
              ? "Erro ao atualizar cliente."
              : "Erro ao cadastrar cliente."),
        );
      }

      if (editingClientId) {
        setClients((prev) =>
          prev.map((c) => (c.id === editingClientId ? (data as Client) : c)),
        );
      } else if (data && "id" in data) {
        setClients((prev) => [data as Client, ...prev]);
      } else {
        await fetchClients();
      }

      closeClientModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha na operação.");
    } finally {
      setSavingClient(false);
    }
  };

  const handleDelete = async (clientId: number) => {
    if (
      !window.confirm(
        "Confirma a exclusão deste cliente? Esta ação não pode ser desfeita.",
      )
    )
      return;

    try {
      setDeletingClientId(clientId);
      const response = await fetch(`${API_URL}/clients/${clientId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok)
        throw new Error("Não foi possível excluir o cliente selecionado.");
      setClients((prev) => prev.filter((c) => c.id !== clientId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir.");
    } finally {
      setDeletingClientId(null);
    }
  };

  const handleTransactionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setTransactionForm((prev) => {
      if (name === "type") {
        const type = value as "income" | "expense";
        return { ...prev, type, payer: type === "income" ? "client" : "user" };
      }
      return { ...prev, [name]: value };
    });
  };

  const openTransactionModal = (clientId: number) => {
    setTransactionForm({
      client_id: clientId,
      sector_id: sectors[0]?.id ? String(sectors[0].id) : "",
      type: "income",
      payer: "client",
      description: "",
      amount: "",
      transaction_date: getToday(),
    });
    setShowTransactionModal(true);
  };

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(transactionForm.amount);
    const sectorId = Number(transactionForm.sector_id);

    if (!transactionForm.client_id || !sectorId || !amount || amount <= 0) {
      alert("Preencha os campos obrigatórios com valores válidos.");
      return;
    }

    try {
      setSavingTransaction(true);
      const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          client_id: transactionForm.client_id,
          sector_id: sectorId,
          type: transactionForm.type,
          payer: transactionForm.type === "income" ? "client" : "user",
          description: transactionForm.description.trim(),
          amount,
          transaction_date: transactionForm.transaction_date,
        }),
      });

      if (!response.ok)
        throw new Error("Erro ao registrar transação vinculada.");
      closeTransactionModal();
      alert("Transação registrada com sucesso!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao registrar.");
    } finally {
      setSavingTransaction(false);
    }
  };

  const filteredClients = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return clients.filter((c) => {
      const matchesSearch =
        !search ||
        c.company_name?.toLowerCase().includes(search) ||
        c.email?.toLowerCase().includes(search) ||
        c.phone?.toLowerCase().includes(search) ||
        c.contact?.toLowerCase().includes(search);

      const matchesType = !typeFilter || c.type === typeFilter;
      const matchesStatus = !statusFilter || c.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [clients, searchTerm, typeFilter, statusFilter]);

  const metrics = useMemo(() => {
    const total = clients.length;
    const active = clients.filter((c) => c.status === "active").length;
    const pj = clients.filter((c) => c.type === "Pessoa Jurídica").length;
    const pf = total - pj;
    return { total, active, pj, pf };
  }, [clients]);

  const handleExportCSV = () => {
    if (filteredClients.length === 0) return;
    const header = "ID,Nome/Razao Social,Tipo,Contato,Email,Telefone,Status\n";
    const rows = filteredClients
      .map(
        (c) =>
          `"${c.id}","${c.company_name}","${c.type}","${c.contact}","${c.email}","${c.phone}","${c.status}"`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carteira_clientes_${getToday()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedClient = clients.find(
    (c) => c.id === transactionForm.client_id,
  );

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Carteira de Clientes
          </h2>
          <p className="text-xs text-slate-500">
            Diretório de empresas tomadoras e pessoas físicas cadastradas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredClients.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
          >
            <Download size={13} className="text-slate-500" />
            Exportar CSV
          </button>

          <button
            type="button"
            onClick={openNewClientModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs transition"
          >
            <UserPlus size={14} />
            Novo Cliente
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">
            Total de Contas
          </span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {metrics.total}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">
            Status Ativo
          </span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-1">
            {metrics.active}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">
            Pessoas Jurídicas (PJ)
          </span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {metrics.pj}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">
            Pessoas Físicas (PF)
          </span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {metrics.pf}
          </p>
        </div>
      </div>

      {/* Tabela e Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por razão, e-mail, contato..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          <div className="flex w-full md:w-auto items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700"
            >
              <option value="">Todos os tipos</option>
              <option value="Pessoa Jurídica">Pessoa Jurídica</option>
              <option value="Pessoa Física">Pessoa Física</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700"
            >
              <option value="">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="m-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchClients}
              className="font-semibold underline"
            >
              Recarregar
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Cliente / Razão Social</th>
                <th className="px-5 py-3">Enquadramento</th>
                <th className="px-5 py-3">Canais de Contato</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Ações Operacionais</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-slate-400"
                  >
                    Sincronizando clientes...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-slate-400"
                  >
                    Nenhum cliente atende aos critérios filtrados.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
                          {client.type === "Pessoa Jurídica" ? (
                            <Building2 size={14} className="text-slate-500" />
                          ) : (
                            client.company_name?.charAt(0).toUpperCase() || "C"
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate max-w-xs">
                            {client.company_name}
                          </p>
                          {client.contact && (
                            <p className="text-[11px] text-slate-500 truncate">
                              {client.contact}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600 font-medium">
                      {client.type}
                    </td>
                    <td className="px-5 py-3">
                      <div className="space-y-0.5 text-slate-600">
                        {client.email && (
                          <div className="flex items-center gap-1.5 truncate max-w-xs">
                            <Mail
                              size={12}
                              className="text-slate-400 shrink-0"
                            />
                            <span className="truncate">{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone
                              size={12}
                              className="text-slate-400 shrink-0"
                            />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          client.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {client.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openTransactionModal(client.id)}
                          title="Lançar transação para este cliente"
                          className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100 font-medium transition"
                        >
                          + Lançamento
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(client)}
                          title="Editar"
                          className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(client.id)}
                          disabled={deletingClientId === client.id}
                          title="Excluir"
                          className="p-1 rounded text-rose-600 hover:text-rose-800 hover:bg-rose-50 disabled:opacity-50 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Cadastro/Edição de Cliente */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                {editingClientId
                  ? "Atualizar Registro de Cliente"
                  : "Novo Cliente"}
              </h3>
              <button
                type="button"
                onClick={closeClientModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Razão Social / Nome Completo *
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Construtora Alfa S.A."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Enquadramento
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    <option value="Pessoa Jurídica">Pessoa Jurídica</option>
                    <option value="Pessoa Física">Pessoa Física</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Status Cadastral
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    E-mail Corporativo
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="financeiro@empresa.com"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Telefone / Ramal
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Pessoa de Contato / Responsável
                </label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Ex: Carlos Andrade (Gerente de Compras)"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeClientModal}
                  disabled={savingClient}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingClient}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition disabled:opacity-50"
                >
                  {savingClient
                    ? "Salvando..."
                    : editingClientId
                      ? "Atualizar Dados"
                      : "Cadastrar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nova Transação Vinculada */}
      {showTransactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Lançamento Financeiro Vinculado
              </h3>
              <button
                type="button"
                onClick={closeTransactionModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTransactionSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Cliente Vinculado
                </label>
                <input
                  type="text"
                  value={selectedClient?.company_name || "Cliente selecionado"}
                  disabled
                  className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tipo de Lançamento
                  </label>
                  <select
                    name="type"
                    value={transactionForm.type}
                    onChange={handleTransactionChange}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    <option value="income">Receita (Cliente Paga)</option>
                    <option value="expense">Despesa (Empresa Paga)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Centro de Custo / Setor *
                  </label>
                  <select
                    name="sector_id"
                    value={transactionForm.sector_id}
                    onChange={handleTransactionChange}
                    required
                    disabled={loadingSectors}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    <option value="">Selecione um setor...</option>
                    {sectors.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Valor Nominal (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    name="amount"
                    value={transactionForm.amount}
                    onChange={handleTransactionChange}
                    required
                    placeholder="0.00"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Data da Competência
                  </label>
                  <input
                    type="date"
                    name="transaction_date"
                    value={transactionForm.transaction_date}
                    onChange={handleTransactionChange}
                    required
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Memorial Descritivo
                </label>
                <input
                  type="text"
                  name="description"
                  value={transactionForm.description}
                  onChange={handleTransactionChange}
                  placeholder="Ex: Faturamento referente à fatura #1024"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeTransactionModal}
                  disabled={savingTransaction}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingTransaction || sectors.length === 0}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition disabled:opacity-50"
                >
                  {savingTransaction ? "Gravando..." : "Confirmar Lançamento"}
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
