import { Suspense } from 'react'
import { getTodayTasks, getInboxTasks } from '@/lib/queries'
import { DailyView } from '@/components/DailyView'

// Shell de carregamento — aparece como conteúdo estático enquanto os dados chegam.
// Sem animações: apenas linhas cinza que imitam a estrutura do conteúdo real.
function TerminalSkeleton() {
  return (
    <div aria-hidden>
      {/* Bolinhas */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: '#27272a' }} />
        ))}
      </div>
      {/* Meta line */}
      <div style={{ height: 12, width: 220, background: '#1f1f22', borderRadius: 2, marginBottom: '4rem' }} />
      {/* Greeting */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ height: 12, width: 180, background: '#1f1f22', borderRadius: 2, marginBottom: '18px' }} />
        <div style={{ height: 12, width: 300, background: '#1f1f22', borderRadius: 2, marginBottom: '10px' }} />
        <div style={{ height: 12, width: 260, background: '#1f1f22', borderRadius: 2 }} />
      </div>
      {/* Dots */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '3.5rem' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#27272a' }} />
        ))}
      </div>
      {/* Tasks */}
      <div style={{ height: 11, width: 40, background: '#1f1f22', borderRadius: 2, marginBottom: '18px' }} />
      {[200, 280, 160].map((w, i) => (
        <div key={i} style={{ height: 14, width: w, background: '#1f1f22', borderRadius: 2, marginBottom: '20px' }} />
      ))}
    </div>
  )
}

async function TodayContent() {
  const [todayTasks, inboxTasks] = await Promise.all([
    getTodayTasks(),
    getInboxTasks(),
  ])
  return <DailyView initialTasks={todayTasks} inboxCount={inboxTasks.length} />
}

export default function HomePage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100dvh' }}>
      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          padding: '3.5rem 3rem',
        }}
      >
        <Suspense fallback={<TerminalSkeleton />}>
          <TodayContent />
        </Suspense>
      </div>
    </main>
  )
}
