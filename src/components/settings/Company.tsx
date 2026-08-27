import React, { useState } from "react";
import {
  Building2,
  MapPin,
  Globe,
  Phone,
  FileText,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export const Company: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "FinanPlus Tecnologia Financeira S.A.",
    cnpj: "45.123.890/0001-92",
    address: "Av. Paulista, 1000, Conj 1402 - Bela Vista, São Paulo - SP",
    website: "https://finanplus.com.br",
    phone: "(11) 3280-9900",
    taxRegime: "lucro_presumido",
    stateRegistration: "112.456.789.001",
    cnae: "62.01-5-01 - Desenvolvimento de programas de computador sob encomenda",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {saved && (
        <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <span>
            Informações corporativas e parâmetros fiscais atualizados com
            sucesso.
          </span>
        </div>
      )}

      {/* Dados Cadastrais */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
          Identificação da Pessoa Jurídica
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Razão social, inscrição cadastral e canais institucionais
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Razão Social / Nome Fantasia
            </label>
            <div className="relative">
              <Building2 className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              CNPJ
            </label>
            <input
              type="text"
              required
              value={formData.cnpj}
              onChange={(e) =>
                setFormData({ ...formData, cnpj: e.target.value })
              }
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Endereço da Sede / Filial
            </label>
            <div className="relative">
              <MapPin className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Domínio / Website
            </label>
            <div className="relative">
              <Globe className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Telefone da Sede
            </label>
            <div className="relative">
              <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Parâmetros Fiscais */}
      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
          Enquadramento & Tributação
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Parâmetros utilizados nos cálculos contábeis do exercício fiscal
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Regime Tributário Vigente
            </label>
            <select
              value={formData.taxRegime}
              onChange={(e) =>
                setFormData({ ...formData, taxRegime: e.target.value })
              }
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
            >
              <option value="mei">Microempreendedor Individual (MEI)</option>
              <option value="simples">Simples Nacional</option>
              <option value="lucro_presumido">Lucro Presumido</option>
              <option value="lucro_real">Lucro Real</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Inscrição Estadual (IE)
            </label>
            <input
              type="text"
              value={formData.stateRegistration}
              onChange={(e) =>
                setFormData({ ...formData, stateRegistration: e.target.value })
              }
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              CNAE Principal
            </label>
            <input
              type="text"
              value={formData.cnae}
              onChange={(e) =>
                setFormData({ ...formData, cnae: e.target.value })
              }
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-xs"
        >
          Salvar Alterações Corporativas
        </button>
      </div>
    </form>
  );
};

export default Company;
