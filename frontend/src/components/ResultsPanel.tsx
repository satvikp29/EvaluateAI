'use client'

import { useState } from 'react'
import { EvalResult } from '@/lib/api'
import Leaderboard from './Leaderboard'
import PerCaseTable from './PerCaseTable'
import ScoreBadge from './ScoreBadge'

interface ResultsPanelProps {
  result: EvalResult
  onBack: () => void
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

const DIMENSION_LABELS = ['accuracy', 'relevance', 'coherence', 'hallucination_risk'] as const
const DIMENSION_DISPLAY: Record<string, string> = {
  accuracy: 'Accuracy',
  relevance: 'Relevance',
  coherence: 'Coherence',
  hallucination_risk: 'Hal. Safety',
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function ResultsPanel({ result, onBack }: ResultsPanelProps) {
  const models = result.leaderboard.map((e) => e.model)
  const winner = result.leaderboard[0]
  const avgScore =
    result.leaderboard.reduce((sum, e) => sum + e.avg_total, 0) / result.leaderboard.length
  const testCaseCount = new Set(result.model_outputs.map((o) => o.test_case_index)).size

  // Compute per-model per-dimension averages
  const dimensionAverages: Record<string, Record<string, number>> = {}
  for (const model of models) {
    const outputs = result.model_outputs.filter((o) => o.model === model)
    if (outputs.length === 0) continue
    dimensionAverages[model] = {
      accuracy: outputs.reduce((s, o) => s + o.scores.accuracy, 0) / outputs.length,
      relevance: outputs.reduce((s, o) => s + o.scores.relevance, 0) / outputs.length,
      coherence: outputs.reduce((s, o) => s + o.scores.coherence, 0) / outputs.length,
      hallucination_risk: outputs.reduce((s, o) => s + o.scores.hallucination_risk, 0) / outputs.length,
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top bar */}
      <div className="flex items-start justify-between border-b border-cream-border pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={onBack}
              className="text-ink-faint hover:text-ink transition-colors duration-150 text-sm flex items-center gap-1.5"
            >
              ← Back
            </button>
          </div>
          <h1 className="font-serif text-3xl font-semibold text-ink">{result.name}</h1>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-sm text-ink-faint">{formatDate(result.created_at)}</span>
            <span
              className={`text-xs font-mono font-medium px-2 py-0.5 rounded border ${
                result.mode === 'ai'
                  ? 'bg-score-high-bg text-score-high border-score-high'
                  : 'bg-gold-light text-gold border-gold-border'
              }`}
            >
              {result.mode === 'ai' ? 'AI Mode' : 'Demo Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Winner', value: MODEL_DISPLAY[winner?.model] || winner?.model || '—', sub: `${winner?.avg_total?.toFixed(1)} avg` },
          { label: 'Avg Score', value: avgScore.toFixed(1), sub: 'across all models' },
          { label: 'Test Cases', value: String(testCaseCount), sub: `${testCaseCount === 1 ? 'case' : 'cases'} evaluated` },
          { label: 'Models', value: String(models.length), sub: `${models.length === 1 ? 'model' : 'models'} compared` },
        ].map((card, i) => (
          <div
            key={card.label}
            className="bg-cream-warm border border-cream-border rounded-xl p-5 animate-slideUp"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <p className="text-xs text-ink-faint uppercase tracking-wider mb-2">{card.label}</p>
            <p className="font-serif text-2xl font-semibold text-ink leading-tight">{card.value}</p>
            <p className="text-xs text-ink-faint mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Leaderboard + Dimension breakdown */}
      <div className="grid grid-cols-2 gap-6">
        <Leaderboard leaderboard={result.leaderboard} />

        {/* Dimension Breakdown */}
        <div className="bg-cream-warm border border-cream-border rounded-xl p-6">
          <h3 className="font-serif text-xl font-semibold text-ink mb-5">Score Breakdown</h3>
          <div className="space-y-5">
            {DIMENSION_LABELS.map((dim) => (
              <div key={dim}>
                <p className="text-xs font-medium text-ink-faint uppercase tracking-wider mb-2">
                  {DIMENSION_DISPLAY[dim]}
                </p>
                <div className="space-y-1.5">
                  {models.map((model) => {
                    const score = dimensionAverages[model]?.[dim] ?? 0
                    const color = MODEL_COLORS[model] || '#7C6B5C'
                    return (
                      <div key={model} className="flex items-center gap-3">
                        <span className="text-xs text-ink-faint w-24 shrink-0 truncate">
                          {MODEL_DISPLAY[model] || model}
                        </span>
                        <div className="flex-1 h-2 bg-cream-border rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${score}%`, backgroundColor: color }}
                          />
                        </div>
                        <span className="font-mono text-xs text-ink-muted w-8 text-right">
                          {score.toFixed(0)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Judge Verdict */}
      <div className="border-l-4 border-gold-border bg-gold-light rounded-r-xl px-6 py-5">
        <p className="text-xs font-medium text-gold uppercase tracking-wider mb-2">Judge Verdict</p>
        <p className="font-serif text-lg italic text-ink leading-relaxed">{result.judge_verdict}</p>
      </div>

      {/* Per-case table */}
      <PerCaseTable
        modelOutputs={result.model_outputs}
        models={models}
        leaderboard={result.leaderboard}
      />
    </div>
  )
}
