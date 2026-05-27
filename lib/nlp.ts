// NLP simples em Português para extração de datas e títulos
// Sem dependências externas — regex pura para zero overhead no bundle

export interface ParsedTask {
  title: string
  dueDate: Date | null
}

/** Retorna o próximo dia da semana (ex: próxima segunda, mesmo que seja hoje) */
function nextWeekday(target: number): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const current = today.getDay()
  let diff = (target - current + 7) % 7
  if (diff === 0) diff = 7 // sempre a PRÓXIMA ocorrência
  const d = new Date(today)
  d.setDate(today.getDate() + diff)
  return d
}

/** Extrai título, data e hora de texto em português natural */
export function parseTask(input: string): ParsedTask {
  let text = input.trim()
  let hours: number | null = null
  let minutes = 0

  // ── Extração de horário ────────────────────────────────────────────────
  // "às 10h30", "às 10:30", "às 10h", "10h30"
  const timePatterns = [
    /\bàs\s+(\d{1,2})h(\d{2})?\b/i,
    /\bàs\s+(\d{1,2}):(\d{2})\b/i,
    /\b(\d{1,2})h(\d{2})?\b/,
  ]

  for (const pattern of timePatterns) {
    const m = text.match(pattern)
    if (m) {
      hours = parseInt(m[1])
      minutes = parseInt(m[2] ?? '0')
      text = text.replace(m[0], '').trim()
      break
    }
  }

  // ── Extração de data relativa ──────────────────────────────────────────
  const todayBase = new Date()
  todayBase.setHours(0, 0, 0, 0)

  const makeDate = (offsetDays: number): Date => {
    const d = new Date(todayBase)
    d.setDate(d.getDate() + offsetDays)
    return d
  }

  type RelEntry = [RegExp, Date]
  const relativePatterns: RelEntry[] = [
    [/\b(hoje)\b/i,                             makeDate(0)],
    [/\b(amanhã|amanha)\b/i,                    makeDate(1)],
    [/\b(depois de amanhã|depois de amanha)\b/i, makeDate(2)],
    [/\b(próxima semana|proxima semana)\b/i,     makeDate(7)],
    [/\b(segunda(-feira)?|seg\.?)\b/i,           nextWeekday(1)],
    [/\b(terça(-feira)?|terca(-feira)?|ter\.?)\b/i, nextWeekday(2)],
    [/\b(quarta(-feira)?|qua\.?)\b/i,            nextWeekday(3)],
    [/\b(quinta(-feira)?|qui\.?)\b/i,            nextWeekday(4)],
    [/\b(sexta(-feira)?|sex\.?)\b/i,             nextWeekday(5)],
    [/\b(sábado|sabado|sáb\.?|sab\.?)\b/i,      nextWeekday(6)],
    [/\b(domingo|dom\.?)\b/i,                    nextWeekday(0)],
  ]

  let dueDate: Date | null = null

  for (const [pattern, date] of relativePatterns) {
    if (pattern.test(text)) {
      dueDate = new Date(date)
      text = text.replace(pattern, '').trim()
      break
    }
  }

  // ── Data absoluta: dd/mm ou dd/mm/aaaa ────────────────────────────────
  if (!dueDate) {
    const absMatch = text.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/)
    if (absMatch) {
      const year = absMatch[3] ? parseInt(absMatch[3]) : new Date().getFullYear()
      dueDate = new Date(year, parseInt(absMatch[2]) - 1, parseInt(absMatch[1]))
      text = text.replace(absMatch[0], '').trim()
    }
  }

  // ── Aplicar horário à data ─────────────────────────────────────────────
  if (hours !== null) {
    if (!dueDate) dueDate = makeDate(0) // sem data → assume hoje
    dueDate.setHours(hours, minutes, 0, 0)
  }

  // ── Limpar título ──────────────────────────────────────────────────────
  const clean = text
    .replace(/\s+/g, ' ')
    .replace(/^[,.\s\-–]+|[,.\s\-–]+$/g, '')
    .trim()

  const title = clean
    ? clean.charAt(0).toUpperCase() + clean.slice(1)
    : input.trim().charAt(0).toUpperCase() + input.trim().slice(1)

  return { title, dueDate }
}

/** Formata uma data de forma amigável para preview no Command Palette */
export function formatDueDatePreview(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const d = new Date(date)
  const dayOnly = new Date(d)
  dayOnly.setHours(0, 0, 0, 0)

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun',
                      'jul', 'ago', 'set', 'out', 'nov', 'dez']

  let dateStr: string
  if (dayOnly.getTime() === today.getTime()) {
    dateStr = 'Hoje'
  } else if (dayOnly.getTime() === tomorrow.getTime()) {
    dateStr = 'Amanhã'
  } else {
    dateStr = `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`
  }

  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0
  if (hasTime) {
    const h = d.getHours().toString().padStart(2, '0')
    const m = d.getMinutes().toString().padStart(2, '0')
    return `${dateStr} às ${h}:${m}`
  }

  return dateStr
}
