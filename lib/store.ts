'use client'

import { create } from 'zustand'

interface FlyStore {
  // Trigger para focar o input de nova tarefa (padrão "incrementar para disparar")
  // Providers.tsx incrementa; TaskList.tsx observa e foca o <input>.
  focusInputTrigger: number
  triggerInputFocus: () => void
}

export const useFlyStore = create<FlyStore>((set) => ({
  focusInputTrigger: 0,
  triggerInputFocus: () => set((s) => ({ focusInputTrigger: s.focusInputTrigger + 1 })),
}))
