import React from 'react';
import { Bell, Mail, Smartphone, Calendar } from 'lucide-react';

const Notifications = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferências de Notificação</h3>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="h-6 w-6 text-blue-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Notificações por E-mail</h4>
                  <p className="text-sm text-gray-500">Receba atualizações importantes no seu e-mail</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-6 w-6 text-blue-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Notificações Push</h4>
                  <p className="text-sm text-gray-500">Receba alertas instantâneos no seu navegador</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 text-blue-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Relatórios Periódicos</h4>
                  <p className="text-sm text-gray-500">Receba relatórios semanais/mensais</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Notificação</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notification1"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="notification1" className="ml-2 block text-sm text-gray-700">
              Alertas de pagamentos
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notification2"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="notification2" className="ml-2 block text-sm text-gray-700">
              Vencimento de faturas
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notification3"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="notification3" className="ml-2 block text-sm text-gray-700">
              Atualizações do sistema
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notification4"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="notification4" className="ml-2 block text-sm text-gray-700">
              Novos relatórios disponíveis
            </label>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Salvar Preferências
        </button>
      </div>
    </div>
  );
};

export default Notifications;