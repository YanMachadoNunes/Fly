'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ── Frases do dia — rotativas, determinísticas por data ───────────────────────
// Qualquer usuário vê a mesma frase no mesmo dia.
// A lógica conta dias desde 01/01/2025 e usa módulo para ciclar.

const PHRASES = [
  'código limpo começa com a mente limpa.',
  'uma tarefa por vez. é assim que se compila a vida.',
  'deletar também é progresso.',
  'o foco é o novo luxo.',
  'feito é melhor que perfeito, mas presente é melhor que ambos.',
  'todo grande projeto começou com um commit pequeno.',
  'respire entre as tarefas, não só entre os deploys.',
  'menos abas, mais clareza.',
  'o silêncio também é uma feature.',
  'rode o dia em modo verbose: preste atenção.',
  'refatore a rotina antes de refatorar o código.',
  'a melhor automação é saber o que não fazer.',
  'todo bug começa como uma escolha pequena.',
  'documente seus dias como documentaria sua API.',
  'merge devagar. resolva os conflitos com calma.',
  'cache o essencial. esqueça o resto.',
  'o que não tem teste, não tem fim.',
  'antes de otimizar, entenda.',
  'logs honestos valem mais que reuniões.',
  'uma boa pausa é parte do build.',
  'throw away o que não serve, com gratidão.',
  'o foco profundo é um privilégio. defenda o seu.',
  'constância vence intensidade no longo prazo.',
  'todo dia é um pull request da sua vida.',
  'menos features, mais propósito.',
  'o tempo é a única variável imutável.',
  'escreva código que o você de amanhã agradeça.',
  'começar é metade do deploy.',
  'se está pesado, modularize.',
  'pequenos hábitos compõem grandes builds.',
  'a pressa é o pior linter.',
  'o que mede sua semana? defina suas métricas.',
  'permita-se ser draft antes de ser release.',
  'calma é performance.',
  'boas decisões são feitas em ambientes silenciosos.',
]

function getPhraseOfTheDay(): string {
  const start = new Date(2025, 0, 1)
  const today = new Date()
  const dayIndex = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return PHRASES[((dayIndex % PHRASES.length) + PHRASES.length) % PHRASES.length]
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'good morning'
  if (h >= 12 && h < 18) return 'good afternoon'
  return 'good evening'
}

function formatClock(d: Date): string {
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

function formatMetaDate(d: Date): string {
  const DAYS   = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
  const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun',
                  'jul', 'ago', 'set', 'out', 'nov', 'dez']
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

// Nome do usuário — configurável via NEXT_PUBLIC_FLY_NAME no .env.local
const USER_NAME = process.env.NEXT_PUBLIC_FLY_NAME ?? 'nat'

interface DailyHeaderProps {
  inboxCount: number
  completed: number
  total: number
}

export function DailyHeader({ inboxCount, completed, total }: DailyHeaderProps) {
  const [now, setNow] = useState<Date | null>(null)

  // Hidratação segura: evita mismatch server/client no relógio
  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const phrase   = getPhraseOfTheDay()
  const greeting = getGreeting()

  // Progresso: 5 dots, preenchidos proporcionalmente
  const TOTAL_DOTS  = 5
  const filledDots  = total === 0 ? 0 : Math.round((completed / total) * TOTAL_DOTS)
  const pct         = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div>
      {/* ── Três bolinhas de janela (macOS / terminal) ─────────────── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
        {(['var(--dot-red)', 'var(--dot-yellow)', 'var(--dot-green)'] as const).map((color, i) => (
          <div
            key={i}
            aria-hidden
            style={{ width: 12, height: 12, borderRadius: '50%', background: color, flexShrink: 0 }}
          />
        ))}
      </div>

      {/* ── Linha de meta: ~/fly on main · data · hora ─────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          marginBottom: '4rem',
        }}
      >
        <span>
          <span style={{ color: 'var(--accent)' }}>~/fly</span>
          <span style={{ color: 'var(--text-muted)' }}> on </span>
          <span style={{ color: 'var(--text-secondary)' }}>main</span>
          {now && (
            <>
              <span style={{ color: 'var(--text-muted)' }}> · </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {formatMetaDate(now)} · {formatClock(now)}
              </span>
            </>
          )}
        </span>
        <Link
          href="/inbox"
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
          }}
        >
          caixa de entrada{inboxCount > 0 ? ` (${inboxCount})` : ''}
        </Link>
      </div>

      {/* ── Bloco de saudação ───────────────────────────────────────── */}
      <div style={{ marginBottom: '3rem' }}>
        {/* Linha 1: ❯ good [period], [nome] */}
        <div style={{ fontSize: '12px', marginBottom: '18px' }}>
          <span style={{ color: 'var(--accent)' }}>❯</span>{' '}
          <span style={{ color: 'var(--text-secondary)' }}>
            {greeting}, {USER_NAME}
          </span>
        </div>

        {/* Linha 2: você está em X de Y tarefas hoje. + frase */}
        <div
          style={{
            fontSize: '13px',
            lineHeight: 1.8,
            maxWidth: '540px',
            color: 'var(--text-secondary)',
          }}
        >
          você está em{' '}
          <span style={{ color: 'var(--text-primary)' }}>
            {completed} de {total}
          </span>{' '}
          tarefas hoje.
          <br />
          <span style={{ color: 'var(--text-muted)' }}># {phrase}</span>
        </div>
      </div>

      {/* ── Progresso em dots ───────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3.5rem' }}>
        {Array.from({ length: TOTAL_DOTS }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: i < filledDots ? 'var(--accent)' : '#27272a',
              flexShrink: 0,
            }}
          />
        ))}
        <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
          {pct}%
        </span>
      </div>
    </div>
  )
}
