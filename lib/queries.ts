// Funções de leitura do banco de dados — NÃO são Server Actions.
// São async functions normais chamadas APENAS de Server Components.
//
// connection() informa ao Next.js 16 que esta função acessa dados
// em tempo de request (incluindo new Date()), evitando pré-renderização
// que congelaria a data no momento do build.

import { connection } from 'next/server'
import { prisma } from './prisma'
import type { TaskRow } from '@/app/actions'

/** Tarefas de hoje (00:00–23:59 do dia atual) */
export async function getTodayTasks(): Promise<TaskRow[]> {
  await connection()

  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  return prisma.task.findMany({
    where: {
      dayOf: { gte: start, lte: end },
    },
    orderBy: [
      { done: 'asc' },
      { dueDate: 'asc' },
      { createdAt: 'asc' },
    ],
  })
}

/** Tarefas da Caixa de Entrada (dias anteriores, não concluídas) */
export async function getInboxTasks(): Promise<TaskRow[]> {
  await connection()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return prisma.task.findMany({
    where: {
      done: false,
      dayOf: { lt: today },
    },
    orderBy: [{ dayOf: 'asc' }, { createdAt: 'asc' }],
  })
}
