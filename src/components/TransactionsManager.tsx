import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Transaction, Sector, Client } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

const QUICK_TAGS = [
  {
    label: "Cloud & TI",
    sector: "Infraestrutura",
    type: "expense",
    desc: "Serviços em Nuvem (AWS/GCP)",
  },
  {
    label: "Folha Salarial",
    sector: "Pessoal & RH",
    type: "expense",
    desc: "Folha de Pagamento / Pró-labore",
  },
  {
    label: "Aluguel & IPTU",
    sector: "Instalações",
    type: "expense",
    desc: "Locação e taxas prediais",
  },
  {
    label: "Honorários / NF",
    sector: "Receita Operacional",
    type: "income",
    desc: "Faturamento Prestação de Serviços",
  },
  {
    label: "Impostos / DARF",
    sector: "Fiscal & Tributário",
    type: "expense",
    desc: "Guia de Recolhimento Tributário",
  },
];

export const TransactionsManager: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estados do Formulário
  const [type, setType] = useState<"income" | "expense">("expense");
  const [description, setDescription] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedSectorId, setSelectedSectorId] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [installments, setInstallments] = useState(1);

  // Filtros da Tabela
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSector, setFilterSector] = useState<string>("all");

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  const loadData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      const [txRes, secRes, cliRes] = await Promise.all([
        fetch(`${API_URL}/transactions`, { headers }),
        fetch(`${API_URL}/sectors`, { headers }),
        fetch(`${API_URL}/clients`, { headers }),
      ]);

      if (txRes.ok) setTransactions(await txRes.json());
      if (secRes.ok) setSectors(await secRes.json());
      if (cliRes.ok) setClients(await cliRes.json());
    } catch (err) {
      console.error("Erro ao sincronizar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  const handleQuickFill = (tag: (typeof QUICK_TAGS)[0]) => {
    setType(tag.type as "income" | "expense");
    setDescription(tag.desc);
    const targetSector = sectors.find((s) =>
      s.name.toLowerCase().includes(tag.sector.toLowerCase()),
    );
    if (targetSector) {
      setSelectedSectorId(String(targetSector.id));
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "");
    if (!v) {
      setAmountStr("");
      return;
    }
    const num = parseFloat(v) / 100;
    setAmountStr(
      num.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    );
  };

  const parseAmountToNumber = (val: string): number => {
    if (!val) return 0;
    return parseFloat(val.replace(/\./g, "").replace(",", ".")) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawVal = parseAmountToNumber(amountStr);

    if (rawVal <= 0) {
      alert("Informe um montante válido superior a R$ 0,00.");
      return;
    }

    if (!description.trim()) {
      alert("Preencha o histórico / descrição do lançamento.");
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();
      const count = isRecurring && installments > 1 ? installments : 1;
      const baseDate = new Date(transactionDate + "T00:00:00");

      const promises = [];
      for (let i = 0; i < count; i++) {
        const currentDate = new Date(baseDate);
        currentDate.setMonth(currentDate.getMonth() + i);
        const isoDate = currentDate.toISOString().split("T")[0];

        const payload = {
          type,
          payer: type === "income" ? "client" : "user",
          description:
            count > 1 ? `${description} (${i + 1}/${count})` : description,
          amount: rawVal,
          transaction_date: isoDate,
          sector_id: selectedSectorId ? Number(selectedSectorId) : null,
          client_id:
            type === "income" && selectedClientId
              ? Number(selectedClientId)
              : null,
        };

        promises.push(
          fetch(`${API_URL}/transactions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }),
        );
      }

      await Promise.all(promises);

      // Sincroniza o ecossistema inteiro instantaneamente
      window.dispatchEvent(new Event("transactions_updated"));

      // Limpa formulário
      setDescription("");
      setAmountStr("");
      setIsRecurring(false);
      setInstallments(1);

      await loadData();
    } catch (err) {
      console.error("Erro ao registrar transação:", err);
      alert("Falha ao registrar a transação.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Deseja realmente estornar este lançamento contábil?")) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/transactions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        window.dispatchEvent(new Event("transactions_updated"));
        await loadData();
      }
    } catch (err) {
      console.error("Erro ao deletar lançamento:", err);
    }
  };

  // Filtragem Dinâmica da Tabela
  const filteredList = useMemo(() => {
    return transactions.filter((t) => {
      const matchText =
        (t.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (t.client_name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (t.sector_name || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchType =
        filterType === "all" ||
        String(t.type).toLowerCase() === filterType.toLowerCase();

      const matchSector =
        filterSector === "all" || String(t.sector_id) === filterSector;

      return matchText && matchType && matchSector;
    });
  }, [transactions, searchQuery, filterType, filterSector]);

  // Totais do Período
  const metrics = useMemo(() => {
    const totalIn = filteredList
      .filter((t) => String(t.type).toLowerCase() === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalOut = filteredList
      .filter((t) => String(t.type).toLowerCase() === "expense")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    return { totalIn, totalOut, net: totalIn - totalOut };
  }, [filteredList]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Receipt size={16} className="text-slate-700" />
            Lançamentos & Conciliação Direta
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro estruturado de receitas, despesas operacionais e provisões
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
            <span className="text-slate-400">Total Líquido:</span>
            <strong
              className={
                metrics.net >= 0
                  ? "text-emerald-700 font-bold"
                  : "text-rose-700 font-bold"
              }
            >
              {formatBRL(metrics.net)}
            </strong>
          </div>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Grid Principal: Formulário Executivo + KPIs de Impacto */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulário de Registro (7 Cols) */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Novo Lançamento Contábil
            </span>

            {/* Alternador Natureza */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition ${
                  type === "expense"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ArrowDownRight size={14} /> Débito (Despesa)
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition ${
                  type === "income"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ArrowUpRight size={14} /> Crédito (Receita)
              </button>
            </div>
          </div>

          {/* Atalhos Rápidos */}
          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1.5">
              Atalhos Rápidos de Categorização:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickFill(t)}
                  className="px-2.5 py-1 rounded text-[11px] font-medium bg-slate-50 border border-slate-200/80 hover:border-slate-400 hover:bg-slate-100 text-slate-700 transition"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campo de Descrição */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Histórico / Descrição da Operação *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Fatura Servidores AWS / Mensalidade Contrato X"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          {/* Grid de Valor e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Montante Financeiro (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono font-bold text-slate-400">
                  R$
                </span>
                <input
                  type="text"
                  required
                  value={amountStr}
                  onChange={handleAmountChange}
                  placeholder="0,00"
                  className="w-full text-sm font-mono font-bold pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Data de Competência *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-1 focus:ring-slate-900 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Grid de Centro de Custo e Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Centro de Custo / Setor
              </label>
              <select
                value={selectedSectorId}
                onChange={(e) => setSelectedSectorId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-1 focus:ring-slate-900 focus:outline-none"
              >
                <option value="">Geral / Sem alocação</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {type === "income" && (
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Cliente Vinculado (Tomador)
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="">Cliente Avulso / Não listado</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Módulo de Recorrência / Parcelamento */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rec-check"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <label
                htmlFor="rec-check"
                className="text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Lançamento Recorrente / Parcelado
              </label>
            </div>

            {isRecurring && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Repetir em:</span>
                <select
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                  className="text-xs px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                >
                  {[2, 3, 6, 12, 24].map((n) => (
                    <option key={n} value={n}>
                      {n} meses
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            {submitting ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Plus size={15} />
            )}
            {submitting
              ? "Gravando no Banco..."
              : "Salvar e Integrar Lançamento"}
          </button>
        </form>

        {/* Resumo Contábil e Projeções Rápidas (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Extrato Executivo Consolidado
              </span>
              <Sparkles size={16} className="text-emerald-400" />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Receitas
                </span>
                <p className="text-base font-mono font-bold text-emerald-400 mt-1">
                  {formatBRL(metrics.totalIn)}
                </p>
              </div>
              <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Despesas
                </span>
                <p className="text-base font-mono font-bold text-rose-400 mt-1">
                  {formatBRL(metrics.totalOut)}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Total de Registros Ativos:</span>
              <strong className="font-mono text-white">
                {filteredList.length} transações
              </strong>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2">
            <span className="text-xs font-bold uppercase text-slate-800 block">
              Regras Contábeis Aplicadas
            </span>
            <ul className="text-[11px] text-slate-500 space-y-1.5 list-disc pl-4">
              <li>
                Lançamentos em crédito são automaticamente classificados como
                direitos de recebimento.
              </li>
              <li>
                Despesas são provisionadas por centro de custo para alimentar o
                DRE Gerencial.
              </li>
              <li>
                A conciliação reflete em tempo real nos motores de IA e no
                Dashboard.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabela de Transações com Busca e Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Registros Contábeis em Aberto
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-2.5 text-slate-400"
              />
              <input
                type="text"
                placeholder="Buscar por descrição, cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 w-56 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700"
            >
              <option value="all">Todas as Naturezas</option>
              <option value="income">Apenas Créditos (+)</option>
              <option value="expense">Apenas Débitos (-)</option>
            </select>

            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700"
            >
              <option value="all">Todos os Setores</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                <th className="px-4 py-3">Competência</th>
                <th className="px-4 py-3">Histórico / Descrição</th>
                <th className="px-4 py-3">Entidade / Cliente</th>
                <th className="px-4 py-3">Centro de Custo</th>
                <th className="px-4 py-3">Natureza</th>
                <th className="px-4 py-3 text-right">Montante</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredList.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8 text-slate-400 text-xs"
                  >
                    Nenhum lançamento contábil encontrado.
                  </td>
                </tr>
              ) : (
                filteredList.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 font-mono text-slate-500">
                      {new Date(
                        t.transaction_date || t.created_at || "",
                      ).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {t.description}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {t.client_name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {t.sector_name || "Geral"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          String(t.type).toLowerCase() === "income"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {String(t.type).toLowerCase() === "income"
                          ? "Crédito"
                          : "Débito"}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono font-semibold ${
                        String(t.type).toLowerCase() === "income"
                          ? "text-emerald-700"
                          : "text-slate-900"
                      }`}
                    >
                      {String(t.type).toLowerCase() === "income" ? "+" : "-"}{" "}
                      {formatBRL(Number(t.amount))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Estornar lançamento"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsManager;
