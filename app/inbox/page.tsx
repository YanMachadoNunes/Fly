import { Suspense } from 'react'
import Link from 'next/link'
import { getInboxTasks } from '@/lib/queries'
import { InboxList } from './InboxList'

export const metadata = { title: 'inbox — fly' }

async function InboxContent() {
  const tasks = await getInboxTasks()
  return <InboxList initialTasks={tasks} />
}

export default function InboxPage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100dvh' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '3.5rem 3rem' }}>

        {/* Bolinhas decorativas */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
          {['var(--dot-red)', 'var(--dot-yellow)', 'var(--dot-green)'].map((c, i) => (
            <div key={i} aria-hidden style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
          ))}
        </div>

        {/* Meta line */}
        <div style={{ fontSize: '12px', marginBottom: '4rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ color: 'var(--accent)' }}>~/fly</span>
            <span style={{ color: 'var(--text-muted)' }}> on </span>
            <span style={{ color: 'var(--text-secondary)' }}>main</span>
          </Link>
          <span style={{ color: 'var(--text-muted)' }}> · </span>
          <span style={{ color: 'var(--text-secondary)' }}>inbox</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '12px', marginBottom: '18px' }}>
            <span style={{ color: 'var(--accent)' }}>❯</span>
            {'  '}
            <span style={{ color: 'var(--text-secondary)' }}>caixa de entrada</span>
          </div>
          <p style={{ fontSize: '13px', lineHeight: 1.8, color: 'var(--text-secondary)', maxWidth: '540px' }}>
            tarefas de dias anteriores não concluídas.
            <br />
            <span style={{ color: 'var(--text-muted)' }}>
              # decida conscientemente o que alocar para hoje.
            </span>
          </p>
        </div>

        {/* Lista com label */}
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '18px' }}>
          pendentes
        </div>

        <Suspense
          fallback={
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>carregando...</div>
          }
        >
          <InboxContent />
        </Suspense>
      </div>
    </main>
  )
}
