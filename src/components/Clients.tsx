import React, { useEffect, useMemo, useState } from "react";
import {
  UserPlus,
  Search,
  Mail,
  Phone,
  Building,
  DollarSign,
  Pencil,
  Trash2,
  X,
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

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

/*
 * ==========================================
 * TOKEN
 * ==========================================
 */

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") ||
    ""
  );
};

/*
 * ==========================================
 * HEADERS
 * ==========================================
 */

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

/*
 * ==========================================
 * COMPONENT
 * ==========================================
 */

const Clients = () => {
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

  /*
   * ==========================================
   * BUSCAR CLIENTES
   * ==========================================
   */

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Usuário não autenticado. Faça login novamente.");
      }

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
        throw new Error(
          "Sessão expirada ou token inválido. Faça login novamente.",
        );
      }

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "Erro ao buscar clientes.";

        throw new Error(message);
      }

      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os clientes.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==========================================
   * BUSCAR SETORES
   * ==========================================
   */

  const fetchSectors = async () => {
    try {
      setLoadingSectors(true);

      const token = getToken();

      if (!token) {
        throw new Error("Usuário não autenticado. Faça login novamente.");
      }

      /*
       * CORRIGIDO:
       * Antes estava /clients
       * Agora está /sectors
       */

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

      if (response.status === 401) {
        throw new Error(
          "Sessão expirada ou token inválido. Faça login novamente.",
        );
      }

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "Erro ao buscar setores.";

        throw new Error(message);
      }

      setSectors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar setores:", error);

      setSectors([]);
    } finally {
      setLoadingSectors(false);
    }
  };

  /*
   * ==========================================
   * CARREGAR DADOS
   * ==========================================
   */

  useEffect(() => {
    fetchClients();
    fetchSectors();
  }, []);

  /*
   * ==========================================
   * FORMULÁRIO DE CLIENTE
   * ==========================================
   */

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * ==========================================
   * NOVO CLIENTE
   * ==========================================
   */

  const openNewClientModal = () => {
    setEditingClientId(null);
    setFormData({ ...emptyClientForm });
    setShowModal(true);
  };

  /*
   * ==========================================
   * EDITAR CLIENTE
   * ==========================================
   */

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

  /*
   * ==========================================
   * FECHAR MODAL CLIENTE
   * ==========================================
   */

  const closeClientModal = () => {
    setShowModal(false);
    setEditingClientId(null);
    setFormData({ ...emptyClientForm });
  };

  /*
   * ==========================================
   * CADASTRAR / EDITAR CLIENTE
   * ==========================================
   */

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.company_name.trim()) {
      alert("Digite o nome do cliente.");
      return;
    }

    const token = getToken();

    if (!token) {
      alert("Usuário não autenticado. Faça login novamente.");
      return;
    }

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

      if (response.status === 401) {
        throw new Error(
          "Sessão expirada ou token inválido. Faça login novamente.",
        );
      }

      if (!response.ok) {
        throw new Error(
          (data && "message" in data && data.message) ||
            (editingClientId
              ? "Erro ao atualizar cliente."
              : "Erro ao cadastrar cliente."),
        );
      }

      if (!data || !("id" in data)) {
        throw new Error("A API não retornou os dados do cliente.");
      }

      if (editingClientId) {
        setClients((previous) =>
          previous.map((client) =>
            client.id === editingClientId ? (data as Client) : client,
          ),
        );
      } else {
        setClients((previous) => [data as Client, ...previous]);
      }

      closeClientModal();

      alert(
        editingClientId
          ? "Cliente atualizado com sucesso!"
          : "Cliente cadastrado com sucesso!",
      );
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o cliente.",
      );
    } finally {
      setSavingClient(false);
    }
  };

  /*
   * ==========================================
   * EXCLUIR CLIENTE
   * ==========================================
   */

  const handleDelete = async (clientId: number) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este cliente?",
    );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      alert("Usuário não autenticado. Faça login novamente.");
      return;
    }

    try {
      setDeletingClientId(clientId);

      /*
       * CORRIGIDO:
       * Antes estava GET /clients
       * Agora está DELETE /clients/:id
       */

      const response = await fetch(`${API_URL}/clients/${clientId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      let data: { message?: string } | null = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (response.status === 401) {
        throw new Error(
          "Sessão expirada ou token inválido. Faça login novamente.",
        );
      }

      if (!response.ok) {
        throw new Error(data?.message || "Erro ao excluir cliente.");
      }

      setClients((previous) =>
        previous.filter((client) => client.id !== clientId),
      );

      alert("Cliente excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o cliente.",
      );
    } finally {
      setDeletingClientId(null);
    }
  };

  /*
   * ==========================================
   * TRANSAÇÃO
   * ==========================================
   */

  const handleTransactionChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setTransactionForm((previous) => {
      if (name === "type") {
        const type = value as "income" | "expense";

        return {
          ...previous,
          type,

          /*
           * Receita = cliente paga
           * Despesa = usuário paga
           */

          payer: type === "income" ? "client" : "user",
        };
      }

      return {
        ...previous,
        [name]: value,
      };
    });
  };

  /*
   * ==========================================
   * ABRIR TRANSAÇÃO
   * ==========================================
   */

  const openTransactionModal = (clientId: number) => {
    setTransactionForm({
      client_id: clientId,
      sector_id: "",
      type: "income",
      payer: "client",
      description: "",
      amount: "",
      transaction_date: getToday(),
    });

    setShowTransactionModal(true);
  };

  /*
   * ==========================================
   * FECHAR TRANSAÇÃO
   * ==========================================
   */

  const closeTransactionModal = () => {
    setShowTransactionModal(false);

    setTransactionForm({
      client_id: 0,
      sector_id: "",
      type: "income",
      payer: "client",
      description: "",
      amount: "",
      transaction_date: getToday(),
    });
  };

  /*
   * ==========================================
   * CADASTRAR TRANSAÇÃO
   * ==========================================
   */

  const handleTransactionSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      alert("Usuário não autenticado. Faça login novamente.");
      return;
    }

    const amount = Number(transactionForm.amount);
    const sectorId = Number(transactionForm.sector_id);

    if (!transactionForm.client_id) {
      alert("Cliente inválido.");
      return;
    }

    if (!sectorId) {
      alert("Selecione um setor.");
      return;
    }

    if (!amount || amount <= 0) {
      alert("Digite um valor válido.");
      return;
    }

    /*
     * Garante que payer e type nunca fiquem incoerentes.
     */

    const payer = transactionForm.type === "income" ? "client" : "user";

    try {
      setSavingTransaction(true);

      /*
       * CORRIGIDO:
       * Antes estava GET /clients
       * Agora está POST /transactions
       */

      const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          client_id: transactionForm.client_id,
          sector_id: sectorId,
          type: transactionForm.type,
          payer,
          description: transactionForm.description.trim(),
          amount,
          transaction_date: transactionForm.transaction_date,
        }),
      });

      let data: { message?: string } | null = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (response.status === 401) {
        throw new Error(
          "Sessão expirada ou token inválido. Faça login novamente.",
        );
      }

      if (!response.ok) {
        throw new Error(data?.message || "Erro ao cadastrar transação.");
      }

      closeTransactionModal();

      alert("Transação cadastrada com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar transação:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar a transação.",
      );
    } finally {
      setSavingTransaction(false);
    }
  };

  /*
   * ==========================================
   * FILTROS
   * ==========================================
   */

  const filteredClients = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return clients.filter((client) => {
      const matchesSearch =
        !search ||
        client.company_name?.toLowerCase().includes(search) ||
        client.email?.toLowerCase().includes(search) ||
        client.phone?.toLowerCase().includes(search) ||
        client.contact?.toLowerCase().includes(search);

      const matchesType = !typeFilter || client.type === typeFilter;

      const matchesStatus = !statusFilter || client.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [clients, searchTerm, typeFilter, statusFilter]);

  /*
   * ==========================================
   * CLIENTE SELECIONADO
   * ==========================================
   */

  const selectedClient = clients.find(
    (client) => client.id === transactionForm.client_id,
  );

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>

          <p className="text-sm text-gray-500 mt-1">
            Gerencie seus clientes e registre transações.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewClientModal}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={20} />
          Novo Cliente
        </button>
      </div>

      {/* TABELA */}

      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        {/* FILTROS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* BUSCA */}

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar clientes..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />

            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>

          {/* TIPO */}

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Todos os tipos</option>

            <option value="Pessoa Física">Pessoa Física</option>

            <option value="Pessoa Jurídica">Pessoa Jurídica</option>
          </select>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Todos os status</option>

            <option value="active">Ativo</option>

            <option value="inactive">Inativo</option>
          </select>
        </div>

        {/* ERRO */}

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* TABELA */}

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Carregando clientes...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {clients.length === 0
                      ? "Nenhum cliente cadastrado."
                      : "Nenhum cliente encontrado com esses filtros."}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* NOME */}

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                          {client.type === "Pessoa Jurídica" ? (
                            <Building className="h-5 w-5 text-gray-500" />
                          ) : (
                            <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                              {client.company_name?.charAt(0).toUpperCase() ||
                                "?"}
                            </div>
                          )}
                        </div>

                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.company_name}
                          </div>

                          {client.contact && (
                            <div className="text-xs text-gray-500 mt-1">
                              {client.contact}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* TIPO */}

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.type}
                    </td>

                    {/* CONTATO */}

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-700 flex items-center gap-2">
                          <Mail size={15} className="text-gray-400" />

                          <span>{client.email || "Sem e-mail"}</span>
                        </div>

                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Phone size={15} className="text-gray-400" />

                          <span>{client.phone || "Sem telefone"}</span>
                        </div>
                      </div>
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          client.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {client.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                    </td>

                    {/* AÇÕES */}

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openTransactionModal(client.id)}
                          className="text-green-600 hover:text-green-800 inline-flex items-center gap-1.5"
                        >
                          <DollarSign size={16} />
                          Transação
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(client)}
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5"
                        >
                          <Pencil size={15} />
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(client.id)}
                          disabled={deletingClientId === client.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                        >
                          <Trash2 size={15} />

                          {deletingClientId === client.id
                            ? "Excluindo..."
                            : "Excluir"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* CONTADOR */}

        {!loading && clients.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Mostrando {filteredClients.length} de {clients.length} clientes
          </div>
        )}
      </div>

      {/* ==========================================
          MODAL CLIENTE
      ========================================== */}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeClientModal();
            }
          }}
        >
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingClientId ? "Editar Cliente" : "Novo Cliente"}
              </h3>

              <button
                type="button"
                onClick={closeClientModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* NOME */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nome da empresa
                </label>

                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Digite o nome da empresa"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* TIPO */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tipo
                </label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Pessoa Jurídica">Pessoa Jurídica</option>

                  <option value="Pessoa Física">Pessoa Física</option>
                </select>
              </div>

              {/* EMAIL */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  E-mail
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="empresa@email.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* TELEFONE */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Telefone
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(34) 99999-9999"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* CONTATO */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Contato
                </label>

                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Nome do responsável"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* STATUS */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="active">Ativo</option>

                  <option value="inactive">Inativo</option>
                </select>
              </div>

              {/* BOTÕES */}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={closeClientModal}
                  disabled={savingClient}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingClient}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingClient
                    ? "Salvando..."
                    : editingClientId
                      ? "Salvar alterações"
                      : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL TRANSAÇÃO
      ========================================== */}

      {showTransactionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeTransactionModal();
            }
          }}
        >
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-semibold text-gray-800">
                Nova Transação
              </h3>

              <button
                type="button"
                onClick={closeTransactionModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleTransactionSubmit} className="space-y-5 p-6">
              {/* CLIENTE */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Cliente
                </label>

                <input
                  type="text"
                  value={
                    selectedClient?.company_name || "Cliente não encontrado"
                  }
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-gray-700"
                />
              </div>

              {/* TIPO */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tipo
                </label>

                <select
                  name="type"
                  value={transactionForm.type}
                  onChange={handleTransactionChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
                >
                  <option value="income">Receita</option>

                  <option value="expense">Despesa</option>
                </select>
              </div>

              {/* PAGADOR */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Quem pagou?
                </label>

                <input
                  type="text"
                  value={
                    transactionForm.payer === "client" ? "Cliente" : "Usuário"
                  }
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-gray-700"
                />

                <p className="mt-1 text-xs text-gray-500">
                  {transactionForm.type === "income"
                    ? "Receita: o cliente realizou o pagamento."
                    : "Despesa: o usuário realizou o pagamento."}
                </p>
              </div>

              {/* SETOR */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Setor
                </label>

                <select
                  name="sector_id"
                  value={transactionForm.sector_id}
                  onChange={handleTransactionChange}
                  required
                  disabled={loadingSectors}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingSectors
                      ? "Carregando setores..."
                      : "Selecione um setor"}
                  </option>

                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>

                {!loadingSectors && sectors.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">
                    Nenhum setor cadastrado.
                  </p>
                )}
              </div>

              {/* VALOR */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Valor
                </label>

                <input
                  type="number"
                  name="amount"
                  value={transactionForm.amount}
                  onChange={handleTransactionChange}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
                />
              </div>

              {/* DESCRIÇÃO */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Descrição
                </label>

                <input
                  type="text"
                  name="description"
                  value={transactionForm.description}
                  onChange={handleTransactionChange}
                  placeholder="Ex: Pagamento de serviço"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
                />
              </div>

              {/* DATA */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Data
                </label>

                <input
                  type="date"
                  name="transaction_date"
                  value={transactionForm.transaction_date}
                  onChange={handleTransactionChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
                />
              </div>

              {/* BOTÕES */}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={closeTransactionModal}
                  disabled={savingTransaction}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    savingTransaction || loadingSectors || sectors.length === 0
                  }
                  className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingTransaction ? "Cadastrando..." : "Cadastrar"}
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
