'use client'

import { useState } from 'react'
import { ModelOutput, LeaderboardEntry } from '@/lib/api'
import ScoreBadge from './ScoreBadge'

interface PerCaseTableProps {
  modelOutputs: ModelOutput[]
  models: string[]
  leaderboard: LeaderboardEntry[]
}

const MODEL_DISPLAY: Record<string, string> = {
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o Mini',
  'claude-3-haiku': 'Claude 3 Haiku',
  'llama-3-70b': 'Llama 3 70B',
}

// Warm earth tones per model — no blue, no purple
const MODEL_COLORS: Record<string, { bg: string; border: string; text: string; bar: string }> = {
  'gpt-4o':        { bg: '#F5EFE8', border: '#9C6840', text: '#7D4E24', bar: '#7D4E24' },
  'gpt-4o-mini':   { bg: '#FDF0E8', border: '#C2693C', text: '#A0522D', bar: '#C2693C' },
  'claude-3-haiku':{ bg: '#EEF2EC', border: '#6B7C5C', text: '#4A5E3A', bar: '#6B7C5C' },
  'llama-3-70b':   { bg: '#F2EFED', border: '#7C6B5C', text: '#5C4E42', bar: '#7C6B5C' },
}

const DEFAULT_COLOR = { bg: '#F3EDE3', border: '#A8A29E', text: '#57534E', bar: '#A8A29E' }

export default function PerCaseTable({ modelOutputs, models, leaderboard }: PerCaseTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const testCaseIndices = Array.from(new Set(modelOutputs.map((o) => o.test_case_index))).sort()

  const getOutput = (model: string, caseIdx: number): ModelOutput | undefined =>
    modelOutputs.find((o) => o.model === model && o.test_case_index === caseIdx)

  // Dynamic grid cols based on model count
  const gridCols =
    models.length === 1 ? 'grid-cols-1'
    : models.length === 2 ? 'grid-cols-2'
    : models.length === 3 ? 'grid-cols-3'
    : 'grid-cols-4'

  return (
    <div className="bg-cream-warm border border-cream-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-cream-border">
        <h3 className="font-serif text-xl font-semibold text-ink">Per-Case Scores</h3>
        <p className="text-sm text-ink-faint mt-0.5">Click any row to expand and compare model outputs side by side</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cream-border">
              <th className="text-left px-6 py-3 text-xs font-medium text-ink-faint uppercase tracking-wider w-8">#</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-ink-faint uppercase tracking-wider">Input</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-ink-faint uppercase tracking-wider">Expected</th>
              {models.map((model) => (
                <th key={model} className="text-center px-4 py-3 text-xs font-medium text-ink-faint uppercase tracking-wider whitespace-nowrap">
                  {MODEL_DISPLAY[model] || model}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {testCaseIndices.map((caseIdx) => {
              const firstOutput = getOutput(models[0], caseIdx)
              const isExpanded = expandedRow === caseIdx

              return (
                <>
                  {/* Collapsed row */}
                  <tr
                    key={`row-${caseIdx}`}
                    className={`border-b border-cream-border cursor-pointer transition-colors duration-150 ${
                      isExpanded ? 'bg-cream' : 'hover:bg-cream'
                    }`}
                    onClick={() => setExpandedRow(isExpanded ? null : caseIdx)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-ink-faint">{caseIdx + 1}</span>
                        <svg
                          className={`w-3.5 h-3.5 text-ink-faint transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-[200px]">
                      <span className="line-clamp-2 font-mono text-xs text-ink">{firstOutput?.input || '—'}</span>
                    </td>
                    <td className="px-4 py-4 max-w-[180px]">
                      <span className="line-clamp-2 text-xs text-ink-muted">{firstOutput?.expected || '—'}</span>
                    </td>
                    {models.map((model) => {
                      const output = getOutput(model, caseIdx)
                      return (
                        <td key={model} className="px-4 py-4 text-center">
                          {output ? (
                            <ScoreBadge score={output.scores.total} size="sm" />
                          ) : (
                            <span className="text-ink-faint text-sm font-mono">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>

                  {/* Expanded side-by-side comparison */}
                  {isExpanded && (
                    <tr key={`expanded-${caseIdx}`}>
                      <td colSpan={3 + models.length} className="px-6 py-6 bg-cream border-b border-cream-border">
                        <div className="space-y-5 animate-fadeIn">

                          {/* Input + Expected side by side */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-medium text-ink-faint uppercase tracking-wider mb-2">Full Input</p>
                              <pre className="font-mono text-xs text-ink bg-cream-warm border border-cream-border rounded-lg px-4 py-3 whitespace-pre-wrap leading-relaxed">
                                {firstOutput?.input}
                              </pre>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-ink-faint uppercase tracking-wider mb-2">Expected Output</p>
                              <pre className="font-mono text-xs text-ink-muted bg-cream-warm border border-cream-border rounded-lg px-4 py-3 whitespace-pre-wrap leading-relaxed">
                                {firstOutput?.expected}
                              </pre>
                            </div>
                          </div>

                          {/* Side-by-side model output cards */}
                          <div>
                            <p className="text-xs font-medium text-ink-faint uppercase tracking-wider mb-3">
                              Model Outputs — Side by Side
                            </p>
                            <div className={`grid ${gridCols} gap-3`}>
                              {models.map((model) => {
                                const output = getOutput(model, caseIdx)
                                const colors = MODEL_COLORS[model] || DEFAULT_COLOR
                                if (!output) return (
                                  <div key={model} className="border border-cream-border rounded-xl overflow-hidden opacity-50">
                                    <div className="px-4 py-2.5 bg-cream-warm border-b border-cream-border">
                                      <span className="text-sm font-medium text-ink-faint">{MODEL_DISPLAY[model] || model}</span>
                                    </div>
                                    <div className="p-4 text-center text-xs text-ink-faint font-mono">failed</div>
                                  </div>
                                )

                                return (
                                  <div
                                    key={model}
                                    className="border rounded-xl overflow-hidden flex flex-col"
                                    style={{ borderColor: colors.border }}
                                  >
                                    {/* Model header */}
                                    <div
                                      className="px-4 py-2.5 border-b flex items-center justify-between"
                                      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
                                    >
                                      <span className="text-sm font-medium" style={{ color: colors.text }}>
                                        {MODEL_DISPLAY[model] || model}
                                      </span>
                                      <ScoreBadge score={output.scores.total} size="sm" />
                                    </div>

                                    {/* Actual output */}
                                    <div className="p-4 flex-1 bg-cream">
                                      <pre className="font-mono text-xs text-ink whitespace-pre-wrap leading-relaxed min-h-[60px]">
                                        {output.actual_output}
                                      </pre>
                                    </div>

                                    {/* Dimension scores bar chart */}
                                    <div className="px-4 py-3 border-t border-cream-border bg-cream-warm space-y-1.5">
                                      {(['accuracy', 'relevance', 'coherence', 'hallucination_risk'] as const).map((dim) => {
                                        const score = output.scores[dim]
                                        const label = dim === 'hallucination_risk' ? 'Hal. Safety' : dim.charAt(0).toUpperCase() + dim.slice(1)
                                        return (
                                          <div key={dim} className="flex items-center gap-2">
                                            <span className="text-[10px] text-ink-faint w-20 shrink-0">{label}</span>
                                            <div className="flex-1 h-1.5 bg-cream-border rounded-full overflow-hidden">
                                              <div
                                                className="h-full rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${score}%`, backgroundColor: colors.bar }}
                                              />
                                            </div>
                                            <span className="font-mono text-[10px] text-ink-muted w-6 text-right">{Math.round(score)}</span>
                                          </div>
                                        )
                                      })}
                                    </div>

                                    {/* Judge reasoning */}
                                    <div
                                      className="px-4 py-3 border-t"
                                      style={{ borderColor: colors.border, backgroundColor: colors.bg }}
                                    >
                                      <p className="text-[11px] italic leading-relaxed" style={{ color: colors.text }}>
                                        "{output.judge_reasoning}"
                                      </p>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
