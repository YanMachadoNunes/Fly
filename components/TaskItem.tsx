'use client'

// Linha de tarefa estilo terminal:
// [símbolo]  [título com @menções coloridas]  [meta direita]
//   12px fix    flex:1                           11px

import type { TaskRow } from '@/app/actions'

interface TaskItemProps {
  task: TaskRow
  isFocused: boolean
  onClick: () => void
  isEditing?: boolean
  editValue?: string
  editRef?: React.RefObject<HTMLInputElement | null>
  onEditChange?: (val: string) => void
  onEditSave?: () => void
  onEditCancel?: () => void
}

// Parseia o título e colore palavras que começam com @
function renderTitle(title: string): React.ReactNode {
  return title.split(/(\s+)/).map((token, i) => {
    if (token.startsWith('@') && token.length > 1) {
      return (
        <span key={i} style={{ color: 'var(--accent)' }}>
          {token}
        </span>
      )
    }
    return token
  })
}

// Meta direita: hora de vencimento (pendente) ou de conclusão (feita)
function getMeta(task: TaskRow): string | null {
  if (task.done && task.completedAt) {
    const d = new Date(task.completedAt)
    const h = d.getHours().toString().padStart(2, '0')
    const m = d.getMinutes().toString().padStart(2, '0')
    return `${h}:${m}`
  }
  if (!task.done && task.dueDate) {
    const d = new Date(task.dueDate)
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0
    const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
    if (hasTime) {
      const h = d.getHours().toString().padStart(2, '0')
      const mn = d.getMinutes().toString().padStart(2, '0')
      return `${d.getDate()} ${months[d.getMonth()]} ${h}:${mn}`
    }
    return `${d.getDate()} ${months[d.getMonth()]}`
  }
  return null
}

export function TaskItem({ task, isFocused, onClick, isEditing, editValue, editRef, onEditChange, onEditSave, onEditCancel }: TaskItemProps) {
  const meta = getMeta(task)

  return (
    <div
      role="checkbox"
      aria-checked={task.done}
      aria-label={task.title}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '16px',
        padding: '10px 0',
        cursor: 'default',
        userSelect: 'none',
        // Fundo sutil quando navegado com ↑↓
        background: isFocused ? 'rgba(167, 139, 250, 0.05)' : 'transparent',
        // Compensar o padding do container para o fundo se estender
        marginLeft: '-3rem',
        marginRight: '-3rem',
        paddingLeft: '3rem',
        paddingRight: '3rem',
        transition: 'background 0.1s',
      }}
    >
      {/* Símbolo ○ / ✓ */}
      <span
        aria-hidden
        style={{
          flexShrink: 0,
          width: '12px',
          fontSize: '12px',
          color: task.done ? 'var(--accent)' : 'var(--text-muted)',
          lineHeight: 1,
        }}
      >
        {task.done ? '✓' : '○'}
      </span>

      {/* Título / input de edição */}
      {isEditing ? (
        <input
          ref={editRef}
          value={editValue ?? ''}
          onChange={e => onEditChange?.(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); onEditSave?.() }
            if (e.key === 'Escape') { e.preventDefault(); onEditCancel?.() }
          }}
          onBlur={onEditSave}
          style={{
            flex: 1,
            fontSize: '14px',
            lineHeight: '20px',
            color: 'var(--text-primary)',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            padding: 0,
            caretColor: 'var(--accent)',
            width: '100%',
          }}
          autoComplete="off"
          spellCheck={false}
        />
      ) : (
        <span
          style={{
            flex: 1,
            fontSize: '14px',
            lineHeight: '20px',
            ...(task.done
              ? {
                  textDecoration: 'line-through',
                  textDecorationColor: 'var(--text-muted)',
                  color: 'var(--text-tertiary)',
                }
              : { color: 'var(--text-primary)' }),
          }}
        >
          {renderTitle(task.title)}
        </span>
      )}

      {/* Meta direita */}
      {meta && (
        <span
          style={{
            flexShrink: 0,
            fontSize: '11px',
            color: 'var(--text-muted)',
            lineHeight: '20px',
          }}
        >
          {meta}
        </span>
      )}
    </div>
  )
}
