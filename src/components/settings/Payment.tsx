import React from 'react';
import { CreditCard, Plus, Clock, AlertCircle } from 'lucide-react';

const Payment = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pagamento</h3>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-6 w-6 text-blue-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">•••• •••• •••• 4242</h4>
                  <p className="text-sm text-gray-500">Expira em 12/2025</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">Principal</span>
                <button className="text-sm text-gray-600 hover:text-gray-800">Editar</button>
              </div>
            </div>
          </div>

          <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
            <Plus className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">Adicionar novo cartão</span>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Pagamentos</h3>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { date: '15/03/2024', description: 'Assinatura Premium', amount: 'R$ 49,90', status: 'Pago' },
                { date: '15/02/2024', description: 'Assinatura Premium', amount: 'R$ 49,90', status: 'Pago' },
                { date: '15/01/2024', description: 'Assinatura Premium', amount: 'R$ 49,90', status: 'Pago' },
              ].map((payment, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fatura Atual</h3>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Plano Premium</h4>
              <p className="text-sm text-gray-500">Próxima cobrança em 05/03/2025</p>
            </div>
            <span className="text-lg font-semibold text-gray-900">R$ 49,90</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Renovação automática ativada</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;