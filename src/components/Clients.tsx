import React, { useEffect, useState } from "react";
import {
  UserPlus,
  Search,
  Mail,
  Phone,
  Building,
  DollarSign,
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

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingClientId, setEditingClientId] = useState<number | null>(null);

  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const [sectors, setSectors] = useState<Sector[]>([]);

  const [transactionForm, setTransactionForm] = useState<TransactionForm>({
    client_id: 0,
    sector_id: "",
    type: "income",
    payer: "client",
    description: "",
    amount: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });

  const [formData, setFormData] = useState({
    company_name: "",
    type: "Pessoa Jurídica",
    contact: "",
    email: "",
    phone: "",
    status: "active",
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const url = editingClientId
        ? `${API_URL}/clients/${editingClientId}`
        : `${API_URL}/clients`;

      const method = editingClientId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(
          editingClientId
            ? "Erro ao atualizar cliente"
            : "Erro ao cadastrar cliente",
        );
      }

      const updatedClient = await response.json();

      if (editingClientId) {
        setClients((previous) =>
          previous.map((client) =>
            client.id === editingClientId ? updatedClient : client,
          ),
        );
      } else {
        setClients((previous) => [updatedClient, ...previous]);
      }

      setFormData({
        company_name: "",
        type: "Pessoa Jurídica",
        contact: "",
        email: "",
        phone: "",
        status: "active",
      });

      setEditingClientId(null);
      setShowModal(false);
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/clients`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao buscar clientes");
        }

        return response.json();
      })
      .then((data) => {
        setClients(data);
      })
      .catch((error) => {
        console.error("Erro:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/sectors`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao buscar setores");
        }

        return response.json();
      })
      .then((data) => {
        setSectors(data);
      })
      .catch((error) => {
        console.error("Erro ao buscar setores:", error);
      });
  }, []);

  const handleTransactionChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setTransactionForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openTransactionModal = (clientId: number) => {
    setTransactionForm({
      client_id: clientId,
      sector_id: "",
      type: "income",
      payer: "client",
      description: "",
      amount: "",
      transaction_date: new Date().toISOString().split("T")[0],
    });

    setShowTransactionModal(true);
  };

  const handleTransactionSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...transactionForm,
          sector_id: Number(transactionForm.sector_id),
          amount: Number(transactionForm.amount),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.message || "Erro ao cadastrar transação");
      }

      await response.json();

      setShowTransactionModal(false);

      alert("Transação cadastrada com sucesso!");
    } catch (error) {
      console.error("Erro:", error);

      alert(
        error instanceof Error ? error.message : "Erro ao cadastrar transação.",
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={20} />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar clientes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>

          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Todos os tipos</option>
            <option value="Pessoa Física">Pessoa Física</option>
            <option value="Pessoa Jurídica">Pessoa Jurídica</option>
          </select>

          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
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
              ) : clients.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Nenhum cliente cadastrado.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {client.type === "Pessoa Jurídica" ? (
                            <Building className="h-5 w-5 text-gray-500" />
                          ) : (
                            <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                              {client.company_name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.company_name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.type}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <Mail size={16} className="text-gray-400" />
                          {client.email || "—"}
                        </div>

                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Phone size={16} className="text-gray-400" />
                          {client.phone || "—"}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          client.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {client.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => openTransactionModal(client.id)}
                        className="text-green-600 hover:text-green-800 inline-flex items-center gap-1"
                      >
                        <DollarSign size={16} />
                        Transação
                      </button>

                      <span className="mx-2">|</span>

                      <button
                        onClick={() => handleEdit(client)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Editar
                      </button>

                      <span className="mx-2">|</span>

                      <button className="text-red-600 hover:text-red-800">
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingClientId ? "Editar Cliente" : "Novo Cliente"}
              </h3>

              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingClientId(null);

                  setFormData({
                    company_name: "",
                    type: "Pessoa Jurídica",
                    contact: "",
                    email: "",
                    phone: "",
                    status: "active",
                  });
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
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

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                >
                  {editingClientId ? "Salvar alterações" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showTransactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Nova Transação
              </h3>

              <button
                type="button"
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleTransactionSubmit} className="space-y-5 p-6">
              {/* CLIENTE */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Cliente
                </label>

                <select
                  value={transactionForm.client_id}
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5"
                >
                  {clients
                    .filter((client) => client.id === transactionForm.client_id)
                    .map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.company_name}
                      </option>
                    ))}
                </select>
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

                <select
                  name="payer"
                  value={transactionForm.payer}
                  onChange={handleTransactionChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
                >
                  <option value="client">Cliente</option>

                  <option value="user">Usuário</option>
                </select>
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
                >
                  <option value="">Selecione um setor</option>

                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
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
                  min="0"
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

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingClientId(null);

                    setFormData({
                      company_name: "",
                      type: "Pessoa Jurídica",
                      contact: "",
                      email: "",
                      phone: "",
                      status: "active",
                    });
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                >
                  Cadastrar
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
