# 📝 Todolist Frontend

Aplicação web moderna de gerenciamento de tarefas construída com **Angular 21**, **Angular Material** e **TypeScript**. O projeto segue uma arquitetura limpa baseada em features com separação clara de responsabilidades.

![Angular](https://img.shields.io/badge/Angular-21.1.x-DD0031?style=flat-square&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
![Angular Material](https://img.shields.io/badge/Angular%20Material-21.1.x-757575?style=flat-square&logo=material-design)

## 🚀 Funcionalidades

### Autenticação
- ✅ **Login** - Autenticação com email e senha
- ✅ **Registro** - Criação de nova conta com validação
- ✅ **Sessão persistente** - Token armazenado localmente com renovação automática
- ✅ **Proteção de rotas** - Guards para rotas autenticadas e de visitantes
- ✅ **Perfil do usuário** - Visualização dos dados do usuário logado

### Gerenciamento de Tarefas
- ✅ **Listagem de tarefas** - Com paginação e filtros por status
- ✅ **Criar tarefa** - Dialog para criação de novas tarefas
- ✅ **Editar tarefa** - Atualização de título, descrição e status
- ✅ **Excluir tarefa** - Remoção com confirmação
- ✅ **Alternar status** - Marcar como pendente ou concluída
- ✅ **Log de atividades** - Histórico de alterações por tarefa com filtro de datas

### Interface
- ✅ **Tema claro/escuro** - Toggle de tema com persistência
- ✅ **Design responsivo** - Adaptável a diferentes tamanhos de tela
- ✅ **Acessibilidade** - Compatível com WCAG AA e AXE checks
- ✅ **Loading states** - Indicadores visuais durante carregamento
- ✅ **Tratamento de erros** - Mensagens de erro amigáveis

---

## 🏗️ Arquitetura do Projeto

O projeto segue uma **arquitetura baseada em features** com separação em camadas inspirada no Clean Architecture/DDD:

```
src/
├── app/
│   ├── core/                    # Módulos core da aplicação
│   │   ├── auth/                # Feature de autenticação (core)
│   │   │   ├── application/     # Facades (orquestração de estado e API)
│   │   │   ├── domain/          # Modelos de domínio
│   │   │   └── infrastructure/  # APIs, DTOs, mappers, guards, interceptors
│   │   ├── http/                # Cliente HTTP centralizado
│   │   └── theme/               # Serviço de gerenciamento de tema
│   │
│   ├── features/                # Features da aplicação
│   │   ├── auth/                # UI de autenticação
│   │   │   ├── auth.routes.ts   # Rotas lazy-loaded
│   │   │   └── ui/              # Componentes (login, register)
│   │   │
│   │   └── tasks/               # Feature de tarefas
│   │       ├── application/     # TaskFacade (gerenciamento de estado)
│   │       ├── domain/          # Modelos (Task, ActivityLog)
│   │       ├── infrastructure/  # API, DTOs, mappers
│   │       └── ui/              # Componentes visuais
│   │           ├── layout/              # Shell layout autenticado
│   │           ├── task-list/           # Lista de tarefas
│   │           ├── task-form-dialog/    # Dialog de criação/edição
│   │           ├── task-activity-log-dialog/  # Histórico de atividades
│   │           └── user-profile-dialog/ # Perfil do usuário
│   │
│   └── shared/                  # Componentes compartilhados
│       └── ui/
│           └── theme-toggle/    # Toggle de tema reutilizável
│
├── environments/                # Configurações por ambiente
│   ├── environment.ts           # Desenvolvimento
│   └── environment.production.ts # Produção
│
└── styles.scss                  # Estilos globais
```

### Camadas da Arquitetura

| Camada | Responsabilidade |
|--------|------------------|
| **Domain** | Modelos de negócio puros (interfaces TypeScript) |
| **Application** | Facades que orquestram estado (signals) e chamadas de API |
| **Infrastructure** | APIs (HttpClient), DTOs, mappers, guards, interceptors |
| **UI** | Componentes Angular (apresentação apenas) |

### Princípios Seguidos

- 🎯 **Componentes nunca chamam HttpClient diretamente**
- 🎯 **Estado gerenciado via Signals** (não RxJS subjects)
- 🎯 **DTOs separados dos modelos de domínio**
- 🎯 **Mapeamento DTO → Domain na camada de infraestrutura**
- 🎯 **Uma Facade por feature** para orquestrar operações
- 🎯 **OnPush change detection** em todos os componentes
- 🎯 **Standalone components** (padrão Angular 20+)
- 🎯 **Lazy loading** de rotas por feature

---

## 🛠️ Tecnologias

- **Framework**: Angular 21.1
- **UI Components**: Angular Material 21.1
- **Linguagem**: TypeScript 5.9
- **Estilos**: SCSS
- **Estado**: Angular Signals
- **HTTP**: HttpClient com interceptors
- **Formulários**: Reactive Forms
- **Testes**: Vitest
- **Build**: Angular CLI + esbuild

---

## 📦 Pré-requisitos

- **Node.js** 20.x ou superior
- **npm** 11.x ou superior (ou use o package manager de sua preferência)
- **Angular CLI** (opcional, pode usar via npx)

---

## 🚀 Como Rodar o Projeto

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd todolist-front
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

O arquivo `src/environments/environment.ts` contém a configuração padrão para desenvolvimento:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://todolist-api.test/api/v1',
};
```

> ⚠️ **Importante**: Certifique-se de que a API backend está rodando e acessível na URL configurada.

### 4. Inicie o servidor de desenvolvimento

```bash
npm start
# ou
ng serve
```

A aplicação estará disponível em: **http://localhost:4200**

---

## 📋 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera build de produção em `dist/` |
| `npm run watch` | Build em modo watch (desenvolvimento) |
| `npm test` | Executa os testes unitários com Vitest |

---

## 🔧 Build de Produção

```bash
npm run build
```

Os artefatos serão gerados no diretório `dist/todolist-front/`. O build de produção inclui:
- Minificação e otimização
- Tree-shaking
- Hash nos nomes dos arquivos para cache busting
- Substituição do environment para produção

---

## 🔐 Autenticação

A aplicação utiliza **JWT (Bearer Token)** para autenticação:

1. Token é obtido no login/registro
2. Armazenado no `localStorage`
3. Enviado automaticamente via `authInterceptor` em todas as requisições para a API
4. Renovação automática quando próximo do vencimento

### Guards de Rota

- **`authGuard`**: Protege rotas que requerem autenticação (redireciona para `/auth/login`)
- **`guestGuard`**: Bloqueia acesso de usuários autenticados a rotas de login/registro

---

## 🎨 Tema

A aplicação suporta temas **claro** e **escuro**:

- Toggle disponível no header e nas telas de autenticação
- Preferência persistida no `localStorage`
- Detecta preferência do sistema operacional no primeiro acesso

---

## 📡 API Backend

A aplicação espera uma API REST no padrão documentado. Endpoints principais:

### Autenticação
- `POST /register` - Criar conta
- `POST /login` - Fazer login
- `POST /refresh` - Renovar token
- `POST /logout` - Fazer logout
- `GET /me` - Dados do usuário

### Tarefas
- `GET /tasks` - Listar tarefas (paginado)
- `POST /tasks` - Criar tarefa
- `GET /tasks/:id` - Detalhes da tarefa
- `PUT /tasks/:id` - Atualizar tarefa
- `DELETE /tasks/:id` - Excluir tarefa
- `GET /tasks/:id/activity-log` - Histórico de atividades

> Consulte o arquivo `.github/copilot-instructions.md` para a documentação completa da API.

---

## 📁 Estrutura de uma Feature

Exemplo da feature `tasks`:

```
tasks/
├── tasks.routes.ts          # Definição de rotas (lazy-loaded)
├── application/
│   └── task.facade.ts       # Orquestra estado e chamadas de API
├── domain/
│   └── task.model.ts        # Interfaces do domínio (Task, ActivityLog, etc.)
├── infrastructure/
│   ├── task.api.ts          # Serviço que faz chamadas HTTP
│   ├── task.dto.ts          # Data Transfer Objects (formato da API)
│   └── task.mapper.ts       # Converte DTO ↔ Domain
└── ui/
    ├── task-list/           # Componente de listagem
    ├── task-form-dialog/    # Dialog de formulário
    └── ...
```

---

## 🧪 Testes

Execute os testes unitários:

```bash
npm test
```

O projeto utiliza **Vitest** como test runner, configurado via Angular CLI.

---

## 📝 Boas Práticas Implementadas

- ✅ Strict TypeScript (sem `any`)
- ✅ Standalone components (Angular 20+)
- ✅ Signals para estado local
- ✅ `computed()` para estado derivado
- ✅ OnPush change detection
- ✅ Control flow nativo (`@if`, `@for`)
- ✅ Reactive Forms
- ✅ Lazy loading de features
- ✅ Acessibilidade (WCAG AA)
- ✅ Injeção via `inject()` ao invés de constructor

---

## 📄 Licença

Este projeto é privado e de uso restrito.
