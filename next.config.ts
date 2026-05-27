import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Habilita o novo modelo de cache do Next.js 16.
  // Com isso, páginas sem 'use cache' são dinâmicas por padrão —
  // executadas a cada request, não pré-renderizadas no build.
  cacheComponents: true,

  // Corrige detecção de root do Turbopack quando há múltiplos bun.lock
  // no sistema de arquivos (ex: bun.lock na home e no projeto).
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig
