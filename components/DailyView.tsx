'use client'

// DailyView — wrapper que centraliza o estado otimista.
// Ao separar leitura (page.tsx Server Component) de escrita aqui,
// garantimos que DailyHeader veja os counts atualizados imediatamente
// após cada toggle — sem esperar pelo revalidatePath do servidor.

import { useOptimistic, useTransition } from 'react'
import { DailyHeader } from './DailyHeader'
import { TaskList } from './TaskList'
import { toggleTask, deleteTask, createTask, type TaskRow } from '@/app/actions'
import { parseTask } from '@/lib/nlp'

interface DailyViewProps {
  initialTasks: TaskRow[]
  inboxCount: number
}

type OptimisticAction =
  | { type: 'toggle'; id: string; done: boolean }
  | { type: 'delete'; id: string }
  | { type: 'add';    task: TaskRow }

function applyOptimistic(state: TaskRow[], action: OptimisticAction): TaskRow[] {
  switch (action.type) {
    case 'toggle':
      return state.map(t =>
        t.id === action.id
          ? { ...t, done: action.done, completedAt: action.done ? new Date() : null }
          : t,
      )
    case 'delete':
      return state.filter(t => t.id !== action.id)
    case 'add':
      return [...state, action.task]
  }
}

export function DailyView({ initialTasks, inboxCount }: DailyViewProps) {
  const [, startTransition] = useTransition()
  const [tasks, dispatch]   = useOptimistic(initialTasks, applyOptimistic)

  const completed = tasks.filter(t => t.done).length
  const total     = tasks.length

  function handleToggle(task: TaskRow) {
    startTransition(async () => {
      dispatch({ type: 'toggle', id: task.id, done: !task.done })
      await toggleTask(task.id, !task.done)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      dispatch({ type: 'delete', id })
      await deleteTask(id)
    })
  }

  function handleCreate(text: string) {
    const { title, dueDate } = parseTask(text)

    // Tarefa otimista temporária (id começa com "opt-")
    const optimisticTask: TaskRow = {
      id:          `opt-${Date.now()}`,
      title,
      done:        false,
      dueDate:     dueDate ?? null,
      dayOf:       dueDate ?? new Date(),
      completedAt: null,
      createdAt:   new Date(),
      updatedAt:   new Date(),
    }

    startTransition(async () => {
      dispatch({ type: 'add', task: optimisticTask })
      await createTask({ title, dueDate })
    })
  }

  return (
    <>
      <DailyHeader inboxCount={inboxCount} completed={completed} total={total} />
      <TaskList
        tasks={tasks}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />
    </>
  )
}
