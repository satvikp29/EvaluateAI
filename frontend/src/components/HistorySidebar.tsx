'use client'

import { useState, useEffect } from 'react'
import { getHistory, getEvalById, HistoryItem, EvalResult } from '@/lib/api'

interface HistorySidebarProps {
  onLoadResult: (result: EvalResult) => void
  refreshKey: number
}

function timeAgo(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

const MODEL_DISPLAY: Record<string, string> = {
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o Mini',
  'claude-3-haiku': 'Claude 3 Haiku',
  'llama-3-70b': 'Llama 3 70B',
}

export default function HistorySidebar({ onLoadResult, refreshKey }: HistorySidebarProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getHistory()
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [refreshKey])

  const handleLoad = async (id: string) => {
    setLoadingId(id)
    try {
      const result = await getEvalById(id)
      onLoadResult(result)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="w-72 flex-shrink-0 border-l border-cream-border bg-cream-warm h-full overflow-y-auto">
      <div className="px-5 py-5 border-b border-cream-border">
        <h2 className="font-serif text-lg font-semibold text-ink">Past Evaluations</h2>
        <p className="text-xs text-ink-faint mt-0.5">Last 10 runs</p>
      </div>

      <div className="p-3 space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg border border-cream-border space-y-2.5">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
              <div className="skeleton h-3 w-2/3" />
            </div>
          ))
        ) : history.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="text-2xl mb-3 opacity-50">◈</div>
            <p className="text-sm text-ink-faint font-serif italic">No evaluations yet.</p>
            <p className="text-xs text-ink-faint mt-1">Run your first eval to see it here.</p>
          </div>
        ) : (
          history.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => handleLoad(item.id)}
              disabled={loadingId === item.id}
              className="w-full text-left p-4 rounded-lg border border-cream-border bg-cream hover:bg-cream-warm hover:border-gold-border transition-all duration-150 group animate-fadeIn disabled:opacity-60"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {loadingId === item.id ? (
                <div className="space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              ) : (
                <>
                  <p className="font-serif text-sm font-medium text-ink group-hover:text-gold transition-colors duration-150 line-clamp-1">
                    {item.name}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gold">
                      {MODEL_DISPLAY[item.winner_model] || item.winner_model}
                    </span>
                    <span className="text-xs text-ink-faint">·</span>
                    <span className="font-mono text-xs text-ink-muted">
                      {item.winner_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-ink-faint">
                    <span>{timeAgo(item.created_at)}</span>
                    <span>·</span>
                    <span>{item.test_case_count} {item.test_case_count === 1 ? 'case' : 'cases'}</span>
                    <span>·</span>
                    <span>{item.model_count} {item.model_count === 1 ? 'model' : 'models'}</span>
                  </div>
                </>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
