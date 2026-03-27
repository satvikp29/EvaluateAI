const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

export interface TestCase {
  input: string
  expected_output: string
}

export interface EvalRequest {
  prompt_template: string
  test_cases: TestCase[]
  models: string[]
  name: string
}

export interface DimensionScore {
  accuracy: number
  relevance: number
  coherence: number
  hallucination_risk: number
  total: number
}

export interface ModelOutput {
  model: string
  test_case_index: number
  input: string
  expected: string
  actual_output: string
  scores: DimensionScore
  judge_reasoning: string
}

export interface LeaderboardEntry {
  model: string
  avg_total: number
  rank: number
  failed?: boolean
}

export interface EvalResult {
  eval_id: string
  name: string
  prompt_template: string
  model_outputs: ModelOutput[]
  leaderboard: LeaderboardEntry[]
  judge_verdict: string
  created_at: string
  mode: string
}

export interface HistoryItem {
  id: string
  name: string
  winner_model: string
  winner_score: number
  created_at: string
  model_count: number
  test_case_count: number
}

export async function runEvaluation(request: EvalRequest): Promise<EvalResult> {
  const response = await fetch(`${API_URL}/api/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }
  return response.json()
}

export async function getHistory(): Promise<HistoryItem[]> {
  const response = await fetch(`${API_URL}/api/history`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

export async function getEvalById(id: string): Promise<EvalResult> {
  const response = await fetch(`${API_URL}/api/history/${id}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}
