'use client'

// TaskList — lista de tarefas estilo terminal + input inline de nova tarefa.
//
// Navegação por teclado:
//   ↑ ↓  →  move focusedIndex (item ativo com fundo rgba(167,139,250,0.05))
//   ␣    →  marca/desmarca tarefa focada
//   Del  →  deleta tarefa focada
//   ⌘K   →  foca o input (via store.focusInputTrigger)

import { useState, useRef, useEffect, useCallback } from 'react'
import { TaskItem } from './TaskItem'
import { useFlyStore } from '@/lib/store'
import type { TaskRow } from '@/app/actions'

interface TaskListProps {
  tasks: TaskRow[]
  onToggle: (task: TaskRow) => void
  onDelete: (id: string) => void
  onCreate: (text: string) => void
  onEdit: (id: string, title: string) => void
}

export function TaskList({ tasks, onToggle, onDelete, onCreate, onEdit }: TaskListProps) {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [inputValue, setInputValue]     = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [editingId, setEditingId]       = useState<string | null>(null)
  const [editValue, setEditValue]       = useState('')
  const inputRef    = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const { focusInputTrigger } = useFlyStore()

  const handleEditSave = useCallback(() => {
    if (editingId && editValue.trim()) {
      onEdit(editingId, editValue.trim())
    }
    setEditingId(null)
    setEditValue('')
  }, [editingId, editValue, onEdit])

  const handleEditCancel = useCallback(() => {
    setEditingId(null)
    setEditValue('')
  }, [])

  // Foca o input de edição assim que entra no modo edição
  useEffect(() => {
    if (editingId) editInputRef.current?.focus()
  }, [editingId])

  // Ordena: pendentes primeiro, concluídas no fim
  const sorted = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  // ⌘K dispara foco no input
  useEffect(() => {
    if (focusInputTrigger > 0) {
      inputRef.current?.focus()
      setFocusedIndex(-1)
    }
  }, [focusInputTrigger])

  // Navegação global por teclado (só ativa fora do input)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (document.activeElement === inputRef.current) return
      if (document.activeElement === editInputRef.current) return
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIndex(i => {
          const next = i + 1
          // Último item → foca o input
          if (next >= sorted.length) {
            inputRef.current?.focus()
            return -1
          }
          return next
        })
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex(i => Math.max(i - 1, 0))
        return
      }

      if (e.key === ' ' && focusedIndex >= 0 && focusedIndex < sorted.length) {
        e.preventDefault()
        onToggle(sorted[focusedIndex])
        return
      }

      if (e.key === 'e' && focusedIndex >= 0 && focusedIndex < sorted.length && !editingId) {
        e.preventDefault()
        const task = sorted[focusedIndex]
        setEditingId(task.id)
        setEditValue(task.title)
        return
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && focusedIndex >= 0 && focusedIndex < sorted.length) {
        e.preventDefault()
        onDelete(sorted[focusedIndex].id)
        setFocusedIndex(i => Math.max(i - 1, -1))
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedIndex, sorted, onToggle, onDelete])

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && inputValue.trim()) {
      onCreate(inputValue.trim())
      setInputValue('')
    }
    if (e.key === 'Escape') {
      setInputValue('')
      inputRef.current?.blur()
    }
    // ↑ a partir do input vai para o último item da lista
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      inputRef.current?.blur()
      setFocusedIndex(sorted.length - 1)
    }
  }

  return (
    <section>
      {/* ── Label de seção ─────────────────────────────────────────── */}
      <div
        style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '18px',
        }}
      >
        hoje
      </div>

      {/* ── Lista de tarefas ────────────────────────────────────────── */}
      {sorted.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          isFocused={index === focusedIndex}
          onClick={() => {
            setFocusedIndex(index)
            onToggle(task)
          }}
          isEditing={editingId === task.id}
          editValue={editValue}
          editRef={editInputRef}
          onEditChange={setEditValue}
          onEditSave={handleEditSave}
          onEditCancel={handleEditCancel}
        />
      ))}

      {/* ── Input de nova tarefa (última linha — sempre visível) ─────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '16px',
          padding: '10px 0',
        }}
      >
        {/* Símbolo ❯ */}
        <span
          aria-hidden
          style={{ flexShrink: 0, width: '12px', fontSize: '12px', color: 'var(--accent)', lineHeight: 1 }}
        >
          ❯
        </span>

        {/* Campo de texto + cursor ▍ */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
          {/* ▍ piscante — visível apenas quando o campo está vazio */}
          {!inputValue && (
            <span
              className="cursor-blink"
              aria-hidden
              style={{
                color: 'var(--accent)',
                fontSize: '14px',
                lineHeight: '20px',
                pointerEvents: 'none',
                userSelect: 'none',
                // Quando o input NÃO está focado, o ▍ aparece antes do placeholder
                // Quando está focado e vazio, aparece no início (posição 0 do texto)
                position: inputFocused ? 'absolute' : 'static',
                left: 0,
                // Esconde o cursor nativo quando mostramos o ▍
              }}
            >
              ▍
            </span>
          )}

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onFocus={() => { setInputFocused(true); setFocusedIndex(-1) }}
            onBlur={() => setInputFocused(false)}
            placeholder={inputFocused ? '' : 'nova tarefa'}
            className="new-task-input"
            style={{
              // Quando o ▍ está em position:absolute, o input precisa de padding-left
              // para o texto não sobrepor o cursor visual
              paddingLeft: inputFocused && !inputValue ? '14px' : 0,
              // Esconde o cursor nativo quando o ▍ está ativo (campo vazio + focado)
              // Quando o usuário começa a digitar, o cursor nativo (accent) reaparece
              caretColor: inputFocused && !inputValue ? 'transparent' : undefined,
            }}
            aria-label="Nova tarefa"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>

      {/* ── Separador + rodapé ──────────────────────────────────────── */}
      <div
        style={{
          borderTop: '0.5px solid var(--border)',
          paddingTop: '1.5rem',
          marginTop: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '28px',
            fontSize: '11px',
            alignItems: 'center',
          }}
        >
          <span>
            <span style={{ color: 'var(--text-secondary)' }}>⌘ K</span>
            {'  '}
            <span style={{ color: 'var(--text-muted)' }}>adicionar</span>
          </span>
          <span>
            <span style={{ color: 'var(--text-secondary)' }}>↑↓</span>
            {'  '}
            <span style={{ color: 'var(--text-muted)' }}>navegar</span>
          </span>
          <span>
            <span style={{ color: 'var(--text-secondary)' }}>␣</span>
            {'  '}
            <span style={{ color: 'var(--text-muted)' }}>concluir</span>
          </span>
          <span>
            <span style={{ color: 'var(--text-secondary)' }}>E</span>
            {'  '}
            <span style={{ color: 'var(--text-muted)' }}>editar</span>
          </span>
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
            fly v0.1
          </span>
        </div>
      </div>
    </section>
  )
}
