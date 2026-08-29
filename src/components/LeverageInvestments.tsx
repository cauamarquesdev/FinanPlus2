import React, { useState, useEffect, useMemo } from "react";
import {
  Rocket,
  TrendingUp,
  DollarSign,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Building2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Check,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface MarketAsset {
  id: string;
  ticker: string;
  type: "acao" | "fii";
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  changePercent: number;
  name: string;
}

export const LeverageInvestments: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState<number>(0);

  const [assets, setAssets] = useState<MarketAsset[]>(() => {
    const saved = localStorage.getItem("finanplus_b3_portfolio_v3");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: "1",
        ticker: "PETR4",
        type: "acao",
        quantity: 300,
        averagePrice: 34.5,
        currentPrice: 43.55,
        changePercent: 1.99,
        name: "Petrobras PN",
      },
      {
        id: "2",
        ticker: "HGLG11",
        type: "fii",
        quantity: 150,
        averagePrice: 158.0,
        currentPrice: 164.8,
        changePercent: 0.42,
        name: "CSHG Logística FII",
      },
      {
        id: "3",
        ticker: "VALE3",
        type: "acao",
        quantity: 200,
        averagePrice: 62.0,
        currentPrice: 78.58,
        changePercent: -0.67,
        name: "Vale S.A.",
      },
    ];
  });

  const [newTicker, setNewTicker] = useState("");
  const [newQty, setNewQty] = useState<number>(100);
  const [newAvgPrice, setNewAvgPrice] = useState<number>(0);
  const [newType, setNewType] = useState<"acao" | "fii">("acao");

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  useEffect(() => {
    localStorage.setItem("finanplus_b3_portfolio_v3", JSON.stringify(assets));
  }, [assets]);

  // Função para buscar preço no backend
  const fetchQuoteFromBackend = async (ticker: string) => {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      // Tenta rota direta ou prefixada com /api
      let res = await fetch(`${API_URL}/investments/quote/${ticker}`, {
        headers,
      });
      if (!res.ok) {
        res = await fetch(`${API_URL}/api/investments/quote/${ticker}`, {
          headers,
        });
      }
      if (res.ok) {
        const data = await res.json();
        if (data.regularMarketPrice > 0) {
          return {
            price: data.regularMarketPrice,
            change: data.regularMarketChangePercent || 0,
            name: data.shortName || ticker,
          };
        }
      }
    } catch (e) {
      // Silently fall back
    }
    return null;
  };

  const refreshMarketQuotes = async () => {
    setLoading(true);
    try {
      const updated = await Promise.all(
        assets.map(async (asset) => {
          const live = await fetchQuoteFromBackend(asset.ticker);
          if (live) {
            return {
              ...asset,
              currentPrice: live.price,
              changePercent: live.change,
              name: live.name || asset.name,
            };
          }
          return asset;
        }),
      );
      setAssets(updated);
    } catch (err) {
      console.error("Erro ao atualizar cotações:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMarketQuotes();
  }, []);

  const formatBRL = (val: number) => {
    const safe =
      typeof val === "number" && !isNaN(val) && isFinite(val) ? val : 0;
    try {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(safe);
    } catch {
      return `R$ ${safe.toFixed(2)}`;
    }
  };

  const portfolioMetrics = useMemo(() => {
    const totalInvested = assets.reduce(
      (sum, a) => sum + a.quantity * a.averagePrice,
      0,
    );
    const totalCurrentValue = assets.reduce(
      (sum, a) => sum + a.quantity * a.currentPrice,
      0,
    );
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalProfitLossPercent =
      totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    const fiiTotal = assets
      .filter((a) => a.type === "fii")
      .reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);
    const acoesTotal = assets
      .filter((a) => a.type === "acao")
      .reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);
    const estimatedMonthlyDividends = fiiTotal * 0.0085;

    return {
      totalInvested,
      totalCurrentValue,
      totalProfitLoss,
      totalProfitLossPercent,
      fiiTotal,
      acoesTotal,
      estimatedMonthlyDividends,
    };
  }, [assets]);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTicker = newTicker.toUpperCase().trim();
    if (!cleanTicker || newQty <= 0) return;

    setSearching(true);
    try {
      const live = await fetchQuoteFromBackend(cleanTicker);
      const price = live ? live.price : newAvgPrice || 10;
      const change = live ? live.change : 0;
      const name = live ? live.name : cleanTicker;

      const newAsset: MarketAsset = {
        id: String(Date.now()),
        ticker: cleanTicker,
        type: newType,
        quantity: newQty,
        averagePrice: newAvgPrice > 0 ? newAvgPrice : price,
        currentPrice: price,
        changePercent: change,
        name: name,
      };

      setAssets((prev) => [...prev, newAsset]);
      setNewTicker("");
      setNewQty(100);
      setNewAvgPrice(0);
      setIsAdding(false);
    } catch (err) {
      console.error("Erro ao adicionar:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleDeleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveEdit = (id: string) => {
    if (editPriceVal > 0) {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, currentPrice: editPriceVal } : a,
        ),
      );
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Rocket size={16} className="text-emerald-600" />
            Alavancagem Financeira & Mercado de Capitais (B3)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cotações em tempo real de Ações e FIIs com consolidação patrimonial
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus size={14} /> Adicionar Ativo B3
          </button>
          <button
            type="button"
            onClick={refreshMarketQuotes}
            disabled={loading}
            className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer text-xs font-medium"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin text-emerald-600" : ""}
            />
            <span className="hidden sm:inline">Atualizar B3</span>
          </button>
        </div>
      </div>

      {/* Cards de Patrimônio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">
            Patrimônio Atual em Mercado
          </span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {formatBRL(portfolioMetrics.totalCurrentValue)}
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Custo Base: {formatBRL(portfolioMetrics.totalInvested)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">
            Lucro / Prejuízo da Carteira
          </span>
          <p
            className={`text-xl font-bold font-mono mt-1 ${
              portfolioMetrics.totalProfitLoss >= 0
                ? "text-emerald-600"
                : "text-rose-600"
            }`}
          >
            {portfolioMetrics.totalProfitLoss >= 0 ? "+" : ""}
            {formatBRL(portfolioMetrics.totalProfitLoss)} (
            {portfolioMetrics.totalProfitLossPercent.toFixed(1)}%)
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Valorização sobre preço médio
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">
            Proventos Estimados
          </span>
          <p className="text-xl font-bold font-mono text-purple-600 mt-1">
            +{formatBRL(portfolioMetrics.estimatedMonthlyDividends)}/mês
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Rendimento passivo isento de FIIs
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">
            Alocação de Ativos
          </span>
          <div className="flex items-center gap-2 mt-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
              Ações:{" "}
              {portfolioMetrics.totalCurrentValue > 0
                ? (
                    (portfolioMetrics.acoesTotal /
                      portfolioMetrics.totalCurrentValue) *
                    100
                  ).toFixed(0)
                : 0}
              %
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              FIIs:{" "}
              {portfolioMetrics.totalCurrentValue > 0
                ? (
                    (portfolioMetrics.fiiTotal /
                      portfolioMetrics.totalCurrentValue) *
                    100
                  ).toFixed(0)
                : 0}
              %
            </span>
          </div>
        </div>
      </div>

      {/* Formulário para Adicionar Ativo B3 */}
      {isAdding && (
        <form
          onSubmit={handleAddAsset}
          className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Search size={14} className="text-emerald-600" />
            Vincular Ativo da B3
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Ticker (ex: PETR4, HGLG11, MXRF11)"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              className="text-xs font-mono uppercase px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-bold"
              required
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              className="text-xs px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900"
            >
              <option value="acao">Ação (B3)</option>
              <option value="fii">Fundo Imobiliário (FII)</option>
            </select>
            <input
              type="number"
              placeholder="Quantidade de Cotas"
              value={newQty || ""}
              onChange={(e) => setNewQty(Number(e.target.value))}
              className="text-xs px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Preço Médio Pago (R$)"
              value={newAvgPrice || ""}
              onChange={(e) => setNewAvgPrice(Number(e.target.value))}
              className="text-xs px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer flex items-center gap-1.5"
            >
              {searching ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Plus size={13} />
              )}
              Vincular Ativo
            </button>
          </div>
        </form>
      )}

      {/* Tabela de Ativos em Tempo Real */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Carteira de Ações & Fundos Imobiliários ({assets.length} Ativos)
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">
            Cotações B3 em Tempo Real
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="px-4 py-3">Ticker / Ativo</th>
                <th className="px-4 py-3 text-center">Tipo</th>
                <th className="px-4 py-3 text-center">Cotas</th>
                <th className="px-4 py-3 text-right">Preço Médio</th>
                <th className="px-4 py-3 text-right">Cotação Atual</th>
                <th className="px-4 py-3 text-center">Var. Dia</th>
                <th className="px-4 py-3 text-right">Posição Total</th>
                <th className="px-4 py-3 text-center">Lucro / Prej.</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.map((a) => {
                const totalPosition = a.quantity * a.currentPrice;
                const profit = totalPosition - a.quantity * a.averagePrice;
                const profitPercent =
                  a.averagePrice > 0
                    ? (profit / (a.quantity * a.averagePrice)) * 100
                    : 0;
                const isEditing = editingId === a.id;

                return (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3">
                      <strong className="font-mono text-slate-900 block font-bold">
                        {a.ticker}
                      </strong>
                      <span className="text-[10px] text-slate-400 truncate max-w-[140px] block">
                        {a.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          a.type === "fii"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {a.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-medium text-slate-700">
                      {a.quantity}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">
                      {formatBRL(a.averagePrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            step="0.01"
                            value={editPriceVal}
                            onChange={(e) =>
                              setEditPriceVal(Number(e.target.value))
                            }
                            className="w-20 px-1.5 py-0.5 text-right font-mono text-xs border border-emerald-500 rounded bg-white text-slate-900"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(a.id)}
                            className="p-1 text-emerald-600 hover:text-emerald-700"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <span
                          className="cursor-pointer hover:underline"
                          title="Clique para editar manualmente se desejar"
                          onClick={() => {
                            setEditingId(a.id);
                            setEditPriceVal(a.currentPrice);
                          }}
                        >
                          {formatBRL(a.currentPrice)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-bold ${
                          a.changePercent >= 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {a.changePercent >= 0 ? (
                          <ArrowUpRight size={13} />
                        ) : (
                          <ArrowDownRight size={13} />
                        )}
                        {a.changePercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {formatBRL(totalPosition)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[11px] font-mono font-bold ${
                          profit >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {profit >= 0 ? "+" : ""}
                        {profitPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(a.id);
                            setEditPriceVal(a.currentPrice);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                          title="Editar cotação manualmente"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAsset(a.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Remover ativo"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeverageInvestments;
