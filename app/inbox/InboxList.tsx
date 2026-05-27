'use client'

import { useOptimistic, useTransition } from 'react'
import Link from 'next/link'
import { rescheduleTask, deleteTask, type TaskRow } from '../actions'

const MONTHS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const DAYS   = ['dom','seg','ter','qua','qui','sex','sáb']

function formatDayOf(date: Date): string {
  const d = new Date(date)
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

interface InboxListProps {
  initialTasks: TaskRow[]
}

export function InboxList({ initialTasks }: InboxListProps) {
  const [, startTransition] = useTransition()
  const [tasks, dispatchOptimistic] = useOptimistic(
    initialTasks,
    (state: TaskRow[], id: string) => state.filter(t => t.id !== id),
  )

  function handleMoveToToday(id: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    startTransition(async () => {
      dispatchOptimistic(id)
      await rescheduleTask(id, today)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      dispatchOptimistic(id)
      await deleteTask(id)
    })
  }

  if (tasks.length === 0) {
    return (
      <div style={{ paddingTop: '2rem', fontSize: '13px', color: 'var(--text-tertiary)' }}>
        <span style={{ color: 'var(--accent)' }}>✓</span>
        {'  '}caixa de entrada limpa.
      </div>
    )
  }

  return (
    <div>
      {tasks.map(task => (
        <div
          key={task.id}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '16px',
            padding: '10px 0',
          }}
        >
          {/* Símbolo */}
          <span style={{ flexShrink: 0, width: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
            ○
          </span>

          {/* Título */}
          <span style={{ flex: 1, fontSize: '14px', color: 'var(--text-primary)' }}>
            {task.title}
          </span>

          {/* Data de origem + ações */}
          <span style={{ flexShrink: 0, fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span>{formatDayOf(task.dayOf)}</span>
            <button
              onClick={() => handleMoveToToday(task.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                color: 'var(--accent)',
                padding: 0,
              }}
            >
              → hoje
            </button>
            <button
              onClick={() => handleDelete(task.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                color: 'var(--text-muted)',
                padding: 0,
              }}
            >
              del
            </button>
          </span>
        </div>
      ))}

      {/* Separador + rodapé */}
      <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: '1.5rem', marginTop: '2rem' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {tasks.length} {tasks.length === 1 ? 'tarefa pendente' : 'tarefas pendentes'}
        </span>
      </div>
    </div>
  )
}
