import React from 'react';
import { HelpCircle, Book, MessageCircle, Phone, Mail } from 'lucide-react';

const Help = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Central de Ajuda</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer">
            <div className="flex items-start space-x-3">
              <Book className="h-6 w-6 text-blue-500" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Documentação</h4>
                <p className="text-sm text-gray-500 mt-1">Acesse nossos guias e tutoriais detalhados</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer">
            <div className="flex items-start space-x-3">
              <MessageCircle className="h-6 w-6 text-blue-500" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Chat ao Vivo</h4>
                <p className="text-sm text-gray-500 mt-1">Fale com nossa equipe de suporte em tempo real</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Perguntas Frequentes</h3>
        <div className="space-y-4">
          {[
            {
              question: 'Como exportar relatórios?',
              answer: 'Você pode exportar relatórios em diversos formatos (PDF, Excel, CSV) através da página de relatórios, clicando no botão "Exportar".'
            },
            {
              question: 'Como adicionar novos usuários?',
              answer: 'Acesse as configurações de equipe e clique em "Adicionar Usuário". Preencha os dados necessários e defina as permissões.'
            },
            {
              question: 'Como configurar integrações?',
              answer: 'Na seção de integrações, escolha o serviço desejado e siga as instruções de configuração específicas.'
            },
          ].map((faq, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200">
              <button className="w-full text-left px-4 py-3 focus:outline-none">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{faq.question}</span>
                  <HelpCircle className="h-5 w-5 text-gray-400" />
                </div>
                <p className="mt-2 text-sm text-gray-500">{faq.answer}</p>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contato</h3>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">0800 3002 8922</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">suporte@FinanPlus.com</span>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Envie sua mensagem</h4>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o assunto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite sua mensagem"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;