import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

// Regenera docs/cambios.md desde el historial de commits de main.
// Filtra cambios internos (chore, ci, test, refactor) y traduce los prefijos
// comunes a frases en español simple, orientadas al cliente.

const EXCLUDED_PREFIXES = [
  'chore', 'ci', 'test', 'refactor', 'build', 'style', 'merge branch',
  'merge pull', 'wip', 'revert', 'docs internal', 'chore:', 'ci:', 'test:',
  'refactor:', 'build:', 'style:', 'revert:'
]

const PREFIX_MAP = {
  'feat': 'Ahora se puede',
  'fix': 'Se corrigió',
  'perf': 'Ahora carga más rápido:',
  'a11y': 'Ahora es más fácil de usar:',
  'docs': 'Documentación actualizada:',
  'security': 'Seguridad mejorada:'
}

function toOutcome(message) {
  const lower = message.toLowerCase().trim()
  for (const prefix of EXCLUDED_PREFIXES) {
    if (lower.startsWith(prefix)) return null
  }
  for (const [prefix, spanish] of Object.entries(PREFIX_MAP)) {
    const re = new RegExp(`^${prefix}\\(?[^)]*\\)?:\\s*`, 'i')
    if (re.test(message)) {
      const rest = message.replace(re, '').trim()
      return `${spanish} ${rest}`
    }
  }
  return `Cambio: ${message}`
}

function generate() {
  const log = execSync(
    'git log main --pretty=format:"%H|%ad|%s" --date=short',
    { encoding: 'utf-8' }
  )
  const lines = log.trim().split('\n').filter(Boolean)
  const entries = []
  for (const line of lines) {
    const [hash, date, message] = line.split('|')
    const outcome = toOutcome(message)
    if (outcome) {
      entries.push(`- **${date}** — ${outcome} (${hash.slice(0, 7)})`)
    }
  }

  const md = `# Cambios visibles para el cliente

> Este archivo se regenera automáticamente desde el historial de cambios. Solo muestra los cambios que un cliente o usuario podría notar, escritos en español simple y ordenados del más reciente al más antiguo.

${entries.length ? entries.join('\n') : 'Aún no hay cambios visibles registrados.'}
`
  writeFileSync('docs/cambios.md', md)
  console.log(`docs/cambios.md updated with ${entries.length} entries`)
}

generate()
