'use client'

// Barra de Energia — substitui o conceito de "streak" (sequência) que,
// quando quebrado, desmotiva completamente. Aqui cada dia começa do zero,
// pronto para ser preenchido. A barra enche conforme tarefas são concluídas.

import { motion } from 'framer-motion'

interface EnergyBarProps {
  completed: number
  total: number
}

const LABELS = [
  { min: 0,   max: 0,   text: 'Lousa em branco',    emoji: '✦' },
  { min: 1,   max: 30,  text: 'Aquecendo',          emoji: '⚡' },
  { min: 31,  max: 60,  text: 'Em ritmo',            emoji: '🔥' },
  { min: 61,  max: 89,  text: 'Voando',              emoji: '🚀' },
  { min: 90,  max: 100, text: 'Modo Fly ativado',    emoji: '✦✦' },
]

function getLabel(pct: number) {
  return LABELS.find((l) => pct >= l.min && pct <= l.max) ?? LABELS[0]
}

export function EnergyBar({ completed, total }: EnergyBarProps) {
  const goal = Math.max(total, 5)
  const pct = total === 0 ? 0 : Math.min(100, Math.round((completed / goal) * 100))
  const label = getLabel(pct)

  return (
    <div className="mb-8">
      {/* Cabeçalho da barra */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-fly-muted tracking-wide uppercase">
          Energia de hoje
        </span>
        <span className="text-xs font-mono text-fly-violet tabular-nums">
          {completed}/{goal} {label.emoji}
        </span>
      </div>

      {/* Track */}
      <div className="relative h-1.5 w-full rounded-full bg-fly-border overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: pct >= 90
              ? 'linear-gradient(90deg, #7C3AED, #06B6D4, #10B981)'
              : pct >= 60
              ? 'linear-gradient(90deg, #7C3AED, #06B6D4)'
              : '#7C3AED',
          }}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />

        {/* Glow no topo quando quase cheio */}
        {pct >= 80 && (
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full blur-sm opacity-60"
            style={{ background: '#7C3AED', width: `${pct}%` }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Status */}
      <motion.p
        key={label.text}
        className="mt-1.5 text-xs text-fly-muted"
        initial={{ opacity: 0, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label.text}
      </motion.p>
    </div>
  )
}
