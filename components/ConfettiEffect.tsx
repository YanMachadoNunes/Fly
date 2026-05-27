'use client'

// Confete minimalista — sem biblioteca externa.
// 12 partículas explodem radialmente usando Framer Motion.
// Posicionado absolute dentro do TaskItem (overflow-visible).

import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'

const COLORS = [
  '#7C3AED', // violet
  '#06B6D4', // cyan
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EC4899', // pink
]

interface ConfettiEffectProps {
  active: boolean
  onComplete: () => void
}

export function ConfettiEffect({ active, onComplete }: ConfettiEffectProps) {
  // Posições calculadas uma vez (useMemo evita recalcular em re-renders)
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      color: COLORS[i % COLORS.length],
      angle: (i / 12) * 360,
      distance: 48 + Math.random() * 28,
      size: 4 + Math.random() * 4,
    })), [])

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {active && (
        <div className="absolute inset-0 pointer-events-none overflow-visible" aria-hidden>
          {particles.map((p) => {
            const rad = (p.angle * Math.PI) / 180
            return (
              <motion.span
                key={p.id}
                className="absolute rounded-full"
                style={{
                  backgroundColor: p.color,
                  width: p.size,
                  height: p.size,
                  top: '50%',
                  left: '50%',
                  marginTop: -p.size / 2,
                  marginLeft: -p.size / 2,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(rad) * p.distance,
                  y: Math.sin(rad) * p.distance,
                  opacity: 0,
                  scale: 0,
                }}
                exit={{}}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              />
            )
          })}
        </div>
      )}
    </AnimatePresence>
  )
}
