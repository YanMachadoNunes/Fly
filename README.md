# Fly ✦

> Gestão de tarefas com neurologia aplicada — feedback sensorial, UI otimista e foco diário.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Estilo | Tailwind CSS v4 |
| Animações | Framer Motion |
| Estado global | Zustand |
| Banco de dados | PostgreSQL via Prisma v7 |
| Áudio | Web Audio API (zero latência) |

## Como rodar

### 1. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com a URL do seu banco de dados.

### 2. Banco de dados (Podman)

```bash
podman run -d \
  --name fly-db \
  -e POSTGRES_PASSWORD=fly \
  -e POSTGRES_DB=fly \
  -p 5432:5432 \
  postgres:16-alpine
```

### 3. Gerar cliente Prisma e migrar

```bash
bunx prisma generate
bunx prisma migrate dev --name init
```

### 4. Rodar em desenvolvimento

```bash
bun dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Features

### ⚡ Feedback Sensorial

- **Som de conclusão** gerado pela Web Audio API no exato milissegundo do clique
- **Escala + brilho** via Framer Motion ao marcar uma tarefa
- **Recompensa variável**: a cada 5ª tarefa, confete minimalista + acorde musical (C-E-G)

### 🔮 Command Palette (Ctrl+K)

- Digita em linguagem natural em Português
- NLP extrai data e hora automaticamente:
  - `"Comprar café amanhã às 10h"` → cria com data
  - `"Reunião sexta"` → próxima sexta-feira
  - `"Pagar conta 15/06"` → data específica
- Preview em tempo real antes de confirmar

### 🚀 UI Otimista

- Marcar tarefa como feita é **instantâneo** — sem loading spinner
- `useOptimistic` do React atualiza a UI antes da resposta do servidor
- Em caso de falha, reverte silenciosamente

### 🎯 Design Anti-Culpa

- **Foco no Hoje**: painel principal mostra apenas o dia atual
- **Caixa de Entrada**: tarefas atrasadas ficam separadas para alocação consciente
- **Barra de Energia**: substitui "streaks" (que desmotivam quando quebrados)

### ⌨️ Navegação por Teclado

| Tecla | Ação |
|-------|------|
| `Ctrl+K` | Abrir Command Palette |
| `↑ ↓` | Navegar entre tarefas |
| `Space` ou `Enter` | Concluir/desconcluir tarefa |
| `Delete` | Deletar tarefa |
| `Esc` | Fechar Command Palette |

---

## Estrutura do Projeto

```
app/
├── actions.ts        # Server Actions (CRUD)
├── globals.css       # Design tokens Tailwind v4 + animações
├── layout.tsx        # Root layout + metadados
├── page.tsx          # Página principal (hoje)
└── inbox/
    ├── page.tsx      # Caixa de entrada (Server Component)
    └── InboxList.tsx # Lista com UI otimista

components/
├── CommandPalette.tsx  # Modal Ctrl+K com NLP
├── ConfettiEffect.tsx  # Partículas de confete (recompensa variável)
├── DailyHeader.tsx     # Cabeçalho com data e saudação
├── EnergyBar.tsx       # Barra de energia diária
├── Providers.tsx       # Client wrapper (listeners de teclado)
├── TaskItem.tsx        # Item de tarefa com animações
└── TaskList.tsx        # Lista com useOptimistic

lib/
├── audio.ts    # Motor Web Audio API
├── nlp.ts      # Parser de linguagem natural (Português)
├── prisma.ts   # Singleton do PrismaClient
└── store.ts    # Zustand store (Command Palette + session counter)

prisma/
└── schema.prisma  # Schema do banco de dados
```
# Fly
