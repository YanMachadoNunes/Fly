// Motor de áudio do Fly — Web Audio API com latência zero
// Ao contrário do <audio> HTML, o AudioContext gera sons diretamente
// no thread de áudio, sem buffering ou delays de rede.

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  // Browsers suspendem o contexto até interação do usuário (autoplay policy)
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/**
 * Pop limpo de alta frequência — feedback para tarefas normais.
 * Onset rápido + decaimento exponencial = sensação de "clique satisfatório".
 */
export function playComplete(): void {
  if (typeof window === 'undefined') return
  try {
    const c = getCtx()
    const now = c.currentTime

    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(900, now)
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04)

    gain.gain.setValueAtTime(0.22, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

    osc.start(now)
    osc.stop(now + 0.14)
  } catch {
    // AudioContext bloqueado pelo browser; falha silenciosa
  }
}

/**
 * Acorde maior C-E-G (mais grave e rico) — recompensa variável a cada 5ª tarefa.
 * Notas escalonadas em 40ms criam sensação de "fanfarra" leve e satisfatória.
 */
export function playBigReward(): void {
  if (typeof window === 'undefined') return
  try {
    const c = getCtx()
    const now = c.currentTime
    const freqs = [523.25, 659.25, 783.99] // C5, E5, G5

    freqs.forEach((freq, i) => {
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.connect(gain)
      gain.connect(c.destination)

      const start = now + i * 0.05
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, start)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.02, start + 0.05)

      gain.gain.setValueAtTime(0.18, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45)

      osc.start(start)
      osc.stop(start + 0.5)
    })
  } catch {
    // AudioContext bloqueado pelo browser; falha silenciosa
  }
}
