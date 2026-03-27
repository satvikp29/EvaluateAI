import { LeaderboardEntry } from '@/lib/api'

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[]
}

const MODEL_COLORS: Record<string, string> = {
  'gpt-4o': '#7D4E24',
  'gpt-4o-mini': '#C2693C',
  'claude-3-haiku': '#6B7C5C',
  'llama-3-70b': '#7C6B5C',
}

const MODEL_DISPLAY: Record<string, string> = {
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o Mini',
  'claude-3-haiku': 'Claude 3 Haiku',
  'llama-3-70b': 'Llama 3 70B',
}

export default function Leaderboard({ leaderboard }: LeaderboardProps) {
  const maxScore = Math.max(...leaderboard.map((e) => e.avg_total), 100)

  return (
    <div className="bg-cream-warm border border-cream-border rounded-xl p-6">
      <h3 className="font-serif text-xl font-semibold text-ink mb-5">Leaderboard</h3>
      <div className="space-y-4">
        {leaderboard.map((entry, idx) => {
          const color = MODEL_COLORS[entry.model] || '#7C6B5C'
          const displayName = MODEL_DISPLAY[entry.model] || entry.model
          const barWidth = entry.failed ? 0 : Math.round((entry.avg_total / maxScore) * 100)

          return (
            <div key={entry.model} className="animate-slideUp" style={{ animationDelay: `${idx * 60}ms` }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-sm font-mono font-medium w-5 text-center ${idx === 0 ? 'text-gold' : 'text-ink-faint'}`}
                  >
                    {entry.rank}
                  </span>
                  <span className="font-sans text-sm font-medium text-ink">{displayName}</span>
                  {entry.failed && (
                    <span className="text-xs bg-score-low-bg text-score-low border border-score-low px-1.5 py-0.5 rounded font-mono">
                      failed
                    </span>
                  )}
                </div>
                <span className="font-mono text-sm font-medium text-ink">
                  {entry.failed ? '—' : entry.avg_total.toFixed(1)}
                </span>
              </div>
              <div className="relative h-2 bg-cream-border rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: color,
                    opacity: entry.failed ? 0.3 : 1,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
