# 🏛️ FinanPlus Enterprise Core (SaaS Financial Engine)

> Plataforma analítica de gestão financeira B2B e tesouraria executiva equipada com CFO Virtual de Inteligência Artificial, cotações de mercado em tempo real e motores preditivos de caixa.

---

## 📌 1. Visão Geral do Produto

O **FinanPlus Enterprise** foi desenvolvido para resolver o clássico *abismo da gestão financeira em PMEs*: a lacuna entre ferramentas excessivamente simples (planilhas ou gerenciadores domésticos sem inteligência estratégica) e grandes ERPs legados (complexos, burocráticos e lentos).

O sistema opera com postura **C-Level**, entregando não apenas registro de receitas e despesas, mas **diagnósticos automatizados de rentabilidade**, **recuperação de lucro oculto**, **alavancagem em mercado de capitais** e **projeções preditivas de liquidez**.

---

## 🎯 2. Módulos & Funcionalidades Principais

### 🧠 CFO Copilot (Inteligência Artificial Nativa)
* **Engenharia:** Integrado aos modelos generativos Gemini com fluxo conversacional *multi-turn*.
* **Capacidade:** Recebe o contexto transacional em tempo real (entradas, saídas, faturamento por cliente, margens) e realiza diagnósticos fiscais, simulações de fluxo e sugestões de corte de custos.

### 🔍 Otimizador de Lucro Oculto (*Profit Recovery Engine*)
* Motor de auditoria contínua de tesouraria.
* Identifica automaticamente:
  * Ralos em assinaturas recorrentes e ferramentas esquecidas;
  * Tarifas bancárias e spreads de intermediação;
  * Capital ocioso na conta corrente sem rendimento de CDI;
  * Gera mensagens prontas para renegociação com fornecedores.

### 📈 Alavancagem Financeira & Mercado de Capitais (B3 em Tempo Real)
* Monitoramento de tesouraria em **Ações** e **Fundos Imobiliários (FIIs)**.
* Integração direta com dados de mercado (preço de fechamento, variação diária e cotação atual).
* Apuração contínua de Lucro/Prejuízo não realizado e projeção de proventos/dividendos isentos mensais.

### ⚖️ Gestão de Endividamento & Passivos
* Controle de contratos de empréstimos, financiamentos e capital de giro (Pronampe, linhas bancárias PJ).
* Cálculo de **Taxa de Comprometimento de Receita** (Dívida/Faturamento) e custo médio ponderado de juros.

### 🛡️ Score Comportamental de Crédito & Mapa de Liquidez Diária
* **Score Interno Dinâmico (0 a 100):** Algoritmo próprio que pondera pontualidade, volume transacionado, tipo de contrato e histórico financeiro de cada cliente sem necessidade de consultas pagas a bureaus.
* **Régua de Cobrança Preventiva:** Gerador de alertas de conciliação e cobrança para WhatsApp e E-mail.
* **Mapa Térmico Diário (D+1 a D+30):** Matriz visual de dias com superávit ou déficit de caixa.

### 📊 Demonstrações & Projeções Executivas
* **DRE Gerencial e Fluxo de Caixa Realizado vs. Previsto.**
* **Forecast com Stress Testing:** Simulação de cenários otimistas, moderados e conservadores com variação de churn e inadimplência.
* **Executive Board Deck:** Relatório consolidado preparado para impressão e exportação em PDF.

---

## 🏗️ 3. Arquitetura do Sistema & Stack Tecnológica

┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)                   │
│   Tailwind CSS  │  Lucide Icons  │  Recharts  │  TypeScript │
└──────────────────────────────┬──────────────────────────────┘
│ HTTP / REST / JSON
┌──────────────────────────────▼──────────────────────────────┐
│                  Backend (Node.js + Express)                │
│    JWT Auth  │  CORS Control  │  Proxy Financeiro B3 (API)  │
└──────────────────────┬──────────────────────┬───────────────┘
│                      │
┌──────────────────────▼───────┐      ┌───────▼───────────────┐
│   PostgreSQL Database Pool   │      │    Google Gemini AI   │
│ (Transactions, Clients, Auth)│      │  (Autonomous CFO Bot) │
└──────────────────────────────┘      └───────────────────────┘


### Tecnologias Utilizadas:
* **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide React, Recharts.
* **Build Tool:** Vite (desenvolvimento ágil e bundle otimizado).
* **Backend:** Node.js, Express.
* **Banco de Dados:** PostgreSQL (driver `pg` nativo com Pool de Conexões).
* **Segurança:** Autenticação via JSON Web Tokens (JWT), senhas com hash criptográfico (bcrypt) e controle de CORS estrito.
* **IA & Dados:** Google Gemini API e integração financeira com a B3.

---

## 🧠 4. Decisões de Desenvolvimento & Trade-offs (O "Porquê")

| Decisão Tomada | Motivação & Justificativa |
| :--- | :--- |
| **Plano Único All-Inclusive (R$ 197/mês)** | Em vez de criar planos segmentados que restringem funcionalidades e geram fricção, adotou-se o modelo *All-In-One*. O software se posiciona como um CFO Virtual de R$ 197/mês que entrega retorno imediato através da recuperação de lucros. |
| **Score Comportamental Baseado em Transações** | Consultas a bureaus tradicionais (Serasa/SPC) possuem custo por consulta e atrito cadastral. O algoritmo comportamental interno calcula o risco de crédito em tempo real a custo zero usando o histórico bancário já existente. |
| **Proxy no Backend para Cotações da B3** | O navegador bloqueia chamadas diretas a APIs de mercado financeiro por restrições de CORS. A rota `/investments/quote/:ticker` no Express atua como proxy seguro com cache de 60 segundos, protegendo o backend contra rate-limits. |
| **Substituição de Valuation por Alavancagem & Endividamento** | Modelos teóricos de Valuation por múltiplos muitas vezes não têm aplicação prática no dia a dia da PME. Substituí-los por **Alavancagem de Investimentos (Ações/FIIs)** e **Controle de Dívidas PJ** entrega valor operacional imediato para a tomada de decisão da tesouraria. |
| **Interface Sóbria em Tailwind (Design System Corporativo)** | Utilização de contrastes sólidos (`slate-900`, `emerald-500`, tipografia `font-mono` para dados financeiros), eliminando estilos genéricos e transmitindo autoridade executiva. |

---

## 📂 5. Estrutura de Diretórios

finanplus/
├── backend/
│   ├── db/
│   │   └── index.js             # Conexão Pool com PostgreSQL
│   ├── middleware/
│   │   └── auth.js               # Validação de Tokens JWT
│   ├── routes/
│   │   ├── ai.js                 # Integração com Gemini API
│   │   ├── auth.js               # Login, Cadastro e Validação
│   │   ├── billing.js            # Assinaturas e Status da Conta
│   │   ├── clients.js            # CRUD de Clientes e Tomadores
│   │   ├── investments.js        # Cotações B3 em Tempo Real
│   │   ├── sectors.js            # Centros de Custo e Categorias
│   │   └── transactions.js       # Livro Caixa, DRE e Extratos
│   ├── .env                      # Variáveis de ambiente (Porta, DB, JWT)
│   └── server.js                 # Ponto de Entrada da API Express
│
└── src/
├── components/
│   ├── AdvancedIntelligenceHub.tsx  # Inteligência Contábil
│   ├── BillingSettings.tsx          # Gestão da Assinatura
│   ├── CashFlowForecast.tsx         # Previsão & Stress Testing
│   ├── CfoCopilot.tsx               # Widget de IA do CFO
│   ├── CreditAndSchedule.tsx        # Score & Mapa de Liquidez
│   ├── DebtManagement.tsx           # Gestão de Passivos e Dívidas
│   ├── ExecutiveHub.tsx             # Relatório Board Deck
│   ├── LeverageInvestments.tsx      # Mercado de Capitais & Aportes
│   ├── ProfitAnalytics.tsx          # Margens & EBITDA
│   ├── ProfitRecoveryEngine.tsx     # Otimizador de Lucro Oculto
│   └── TransactionsManager.tsx      # Lançamentos e Conciliação
├── types/
│   └── index.ts                     # Interfaces TypeScript Globais
├── App.tsx                          # Orquestrador Principal e Navegação
└── main.tsx                         # Bootstrap da Aplicação


---

## 🚀 6. Como Executar o Projeto Localmente

### Pré-requisitos:
* Node.js (versão 18 ou superior)
* Instância do PostgreSQL em execução

### 1. Configurar e Rodar o Backend:
```bash
cd backend
npm install

# Crie o arquivo .env no diretório /backend com:
# PORT=3000
# DATABASE_URL=postgresql://usuario:senha@localhost:5432/finanplus
# JWT_SECRET=seu_jwt_secret_seguro
# GEMINI_API_KEY=sua_chave_gemini

npm run dev
# ou
node server.js
2. Configurar e Rodar o Frontend:
Bash
# Na raiz do projeto:
npm install
npm run dev
Acesse a aplicação no navegador em http://localhost:5173.
```
### 📄 Licença
Distribuído sob licença proprietária comercial. Todos os direitos reservados.
