import React from 'react';
import { Shield, Key, Smartphone, History } from 'lucide-react';

const Security = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Segurança da Conta</h3>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start space-x-3">
              <Key className="h-6 w-6 text-blue-500 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Alterar Senha</h4>
                  <button className="text-sm text-blue-600 hover:text-blue-700">Alterar</button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Última alteração há 3 meses</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start space-x-3">
              <Smartphone className="h-6 w-6 text-blue-500 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Autenticação em Dois Fatores</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-1">Adicione uma camada extra de segurança</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sessões Ativas</h3>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-green-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Chrome - Windows</h4>
                  <p className="text-xs text-gray-500">São Paulo, Brasil • Ativo agora</p>
                </div>
              </div>
              <button className="text-sm text-red-600 hover:text-red-700">Encerrar</button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-green-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Safari - iPhone</h4>
                  <p className="text-xs text-gray-500">São Paulo, Brasil • 2 horas atrás</p>
                </div>
              </div>
              <button className="text-sm text-red-600 hover:text-red-700">Encerrar</button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Atividades</h3>
        <div className="space-y-3">
          {[
            { action: 'Login bem-sucedido', date: '2025-02-15 14:30', location: 'Uberaba, BR' },
            { action: 'Senha alterada', date: '2025-02-10 09:15', location: 'São Paulo, BR' },
            { action: 'Nova sessão iniciada', date: '2025-02-05 16:45', location: 'Luiziania, BR' },
          ].map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <History className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.date} • {activity.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Security;