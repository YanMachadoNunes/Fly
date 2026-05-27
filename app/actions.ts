'use server'

// Server Actions — funções de MUTAÇÃO chamadas pelo lado cliente.
// 'use server' marca estas funções para serem chamadas via POST
// de Client Components (TaskList, InboxList, CommandPalette).
//
// Para LEITURA de dados, veja lib/queries.ts.

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type TaskRow = {
  id: string
  title: string
  done: boolean
  dueDate: Date | null
  dayOf: Date
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/** Cria uma nova tarefa */
export async function createTask(data: {
  title: string
  dueDate?: Date | null
  dayOf?: Date
}): Promise<TaskRow> {
  const task = await prisma.task.create({
    data: {
      title: data.title,
      dueDate: data.dueDate ?? null,
      dayOf: data.dayOf ?? data.dueDate ?? new Date(),
    },
  })
  revalidatePath('/')
  revalidatePath('/inbox')
  return task
}

/** Alterna o status de conclusão de uma tarefa */
export async function toggleTask(id: string, done: boolean): Promise<TaskRow> {
  const task = await prisma.task.update({
    where: { id },
    data: {
      done,
      completedAt: done ? new Date() : null,
    },
  })
  revalidatePath('/')
  return task
}

/** Deleta uma tarefa */
export async function deleteTask(id: string): Promise<void> {
  await prisma.task.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/inbox')
}

/** Edita o título de uma tarefa */
export async function updateTask(id: string, title: string): Promise<TaskRow> {
  const task = await prisma.task.update({
    where: { id },
    data: { title },
  })
  revalidatePath('/')
  revalidatePath('/inbox')
  return task
}

/** Move uma tarefa para outro dia (Caixa de Entrada → hoje/futuro) */
export async function rescheduleTask(id: string, dayOf: Date): Promise<TaskRow> {
  const task = await prisma.task.update({
    where: { id },
    data: { dayOf },
  })
  revalidatePath('/')
  revalidatePath('/inbox')
  return task
}
