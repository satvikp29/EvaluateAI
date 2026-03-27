'use client'

import { useState } from 'react'
import { EvalRequest, EvalResult, runEvaluation } from '@/lib/api'

const AVAILABLE_MODELS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', tag: 'fast · cheap' },
  { id: 'gpt-4o', name: 'GPT-4o', tag: 'smart · expensive' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', tag: 'fast · concise' },
  { id: 'llama-3-70b', name: 'Llama 3 70B', tag: 'open source' },
]

const DEMO_DATA = {
  name: 'Customer Review Classifier',
  promptTemplate:
    'Summarize this customer review in one sentence and label it positive, negative, or neutral.\n\nReview: {{input}}',
  models: ['gpt-4o-mini', 'gpt-4o', 'claude-3-haiku', 'llama-3-70b'],
  testCases: [
    {
      input:
        'I ordered the noise-cancelling headphones and they arrived two days early. The sound quality is absolutely incredible — deep bass, crystal-clear highs, and the ANC blocks out everything. Battery lasts all day easily. Best purchase I have made this year.',
      expected_output:
        'A highly satisfied customer praises early delivery, exceptional sound quality, effective noise cancellation, and long battery life. Positive.',
    },
    {
      input:
        'The jacket looked great in the photos but the material feels really cheap in person. Stitching started coming loose after just one wash. Customer service took a week to respond and only offered a 10% discount. Very disappointed.',
      expected_output:
        'A disappointed customer reports poor material quality, quick stitching failure, and slow, unhelpful customer service. Negative.',
    },
    {
      input:
        'The standing desk does what it says — goes up and down, holds my monitors fine. Setup took about 45 minutes which is expected. Nothing extraordinary but nothing wrong either. Shipping was on time.',
      expected_output:
        'A customer describes a functional standing desk with average setup time and on-time delivery, meeting but not exceeding expectations. Neutral.',
    },
  ],
}

interface EvalSetupProps {
  onResult: (result: EvalResult) => void
}

export default function EvalSetup({ onResult }: EvalSetupProps) {
  const [evalName, setEvalName] = useState('')
  const [promptTemplate, setPromptTemplate] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-4o-mini', 'gpt-4o'])
  const [testCases, setTestCases] = useState([
    { input: '', expected_output: '' },
    { input: '', expected_output: '' },
  ])
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleModel = (modelId: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelId) ? prev.filter((m) => m !== modelId) : [...prev, modelId]
    )
  }

  const addTestCase = () => {
    if (testCases.length < 10) {
      setTestCases([...testCases, { input: '', expected_output: '' }])
    }
  }

  const removeTestCase = (idx: number) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter((_, i) => i !== idx))
    }
  }

  const updateTestCase = (idx: number, field: 'input' | 'expected_output', value: string) => {
    const updated = [...testCases]
    updated[idx] = { ...updated[idx], [field]: value }
    setTestCases(updated)
  }

  const loadDemo = () => {
    setEvalName(DEMO_DATA.name)
    setPromptTemplate(DEMO_DATA.promptTemplate)
    setSelectedModels(DEMO_DATA.models)
    setTestCases(DEMO_DATA.testCases)
    setError(null)
  }

  const isValid =
    evalName.trim() &&
    promptTemplate.trim() &&
    selectedModels.length > 0 &&
    testCases.some((tc) => tc.input.trim() && tc.expected_output.trim())

  const handleRun = async () => {
    setIsRunning(true)
    setError(null)
    try {
      const validCases = testCases.filter((tc) => tc.input.trim() && tc.expected_output.trim())
      const request: EvalRequest = {
        name: evalName.trim(),
        prompt_template: promptTemplate.trim(),
        models: selectedModels,
        test_cases: validCases,
      }
      const result = await runEvaluation(request)
      onResult(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Evaluation failed. Please try again.')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-cream-border pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl font-semibold text-ink">EvaluateAI</h1>
            <p className="text-ink-muted mt-1.5 text-sm">Compare LLM models on your own test cases. No API key needed for demo mode.</p>
          </div>
          <button
            onClick={loadDemo}
            title="Autofill with a customer review example so you can run instantly"
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 border border-gold-border bg-gold-light text-gold rounded-lg text-sm font-medium hover:bg-gold hover:text-cream transition-all duration-150 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Load Demo
          </button>
        </div>
        <div className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-gold-light border border-gold-border rounded-lg">
          <svg className="w-4 h-4 text-gold shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-xs text-gold leading-relaxed">
            <strong>Quick demo:</strong> Click <em>Load Demo</em> above to autofill a customer review classifier with 3 test cases across all 4 models, then hit <em>Run Evaluation</em> to see results instantly.
          </p>
        </div>
      </div>

      {/* Eval Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-ink">Evaluation Name</label>
        <input
          type="text"
          value={evalName}
          onChange={(e) => setEvalName(e.target.value)}
          placeholder="e.g. Sentiment classifier"
          className="w-full px-4 py-2.5 bg-cream-warm border border-cream-border rounded-lg text-ink placeholder-ink-faint font-sans text-sm focus:outline-none focus:border-gold-border focus:ring-1 focus:ring-gold-border transition-all duration-150"
        />
      </div>

      {/* Prompt Template */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-ink">Prompt Template</label>
        <p className="text-xs text-ink-faint">Use <code className="font-mono bg-cream-warm px-1 py-0.5 rounded border border-cream-border">{"{{input}}"}</code> where each test case input should be inserted.</p>
        <textarea
          value={promptTemplate}
          onChange={(e) => setPromptTemplate(e.target.value)}
          placeholder={"Summarize this customer review in one sentence and label it positive, negative, or neutral.\n\nReview: {{input}}"}
          rows={4}
          className="w-full px-4 py-3 bg-cream-warm border border-cream-border rounded-lg text-ink placeholder-ink-faint font-mono text-sm focus:outline-none focus:border-gold-border focus:ring-1 focus:ring-gold-border transition-all duration-150 resize-y"
        />
      </div>

      {/* Model Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-ink">Models to Evaluate</label>
        <div className="grid grid-cols-2 gap-3">
          {AVAILABLE_MODELS.map((model) => {
            const isSelected = selectedModels.includes(model.id)
            return (
              <button
                key={model.id}
                onClick={() => toggleModel(model.id)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                  isSelected
                    ? 'border-gold-border bg-gold-light'
                    : 'border-cream-border bg-cream-warm hover:border-ink-faint'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                    <svg className="w-3 h-3 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
                <p className="font-sans text-sm font-medium text-ink pr-6">{model.name}</p>
                <p className="font-mono text-xs text-ink-faint mt-0.5">{model.tag}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Test Cases */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-ink">
          Test Cases <span className="text-ink-faint font-normal">({testCases.length}/10)</span>
        </label>

        <div className="space-y-4">
          {testCases.map((tc, idx) => (
            <div key={idx} className="border border-cream-border rounded-xl overflow-hidden animate-fadeIn">
              <div className="flex items-center justify-between px-4 py-2.5 bg-cream-warm border-b border-cream-border">
                <span className="text-xs font-medium text-ink-faint uppercase tracking-wider">Case {idx + 1}</span>
                {testCases.length > 1 && (
                  <button
                    onClick={() => removeTestCase(idx)}
                    className="text-ink-faint hover:text-score-low transition-colors duration-150 text-lg leading-none"
                    aria-label="Remove test case"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 divide-x divide-cream-border">
                <div className="p-4">
                  <p className="text-xs text-ink-faint mb-2 font-medium">Input</p>
                  <textarea
                    value={tc.input}
                    onChange={(e) => updateTestCase(idx, 'input', e.target.value)}
                    placeholder="Test input..."
                    rows={3}
                    className="w-full bg-cream border border-cream-border rounded-lg px-3 py-2 font-mono text-xs text-ink placeholder-ink-faint focus:outline-none focus:border-gold-border focus:ring-1 focus:ring-gold-border transition-all duration-150 resize-y"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-ink-faint mb-2 font-medium">Expected Output</p>
                  <textarea
                    value={tc.expected_output}
                    onChange={(e) => updateTestCase(idx, 'expected_output', e.target.value)}
                    placeholder="Expected output..."
                    rows={3}
                    className="w-full bg-cream border border-cream-border rounded-lg px-3 py-2 font-mono text-xs text-ink placeholder-ink-faint focus:outline-none focus:border-gold-border focus:ring-1 focus:ring-gold-border transition-all duration-150 resize-y"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {testCases.length < 10 && (
          <button
            onClick={addTestCase}
            className="w-full py-2.5 border-2 border-dashed border-cream-border text-ink-faint hover:border-gold-border hover:text-gold text-sm font-medium rounded-xl transition-all duration-150"
          >
            + Add test case
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-score-low-bg border border-score-low rounded-lg">
          <p className="text-sm text-score-low">{error}</p>
        </div>
      )}

      {/* Run Button */}
      <div className="pb-4">
        <button
          onClick={handleRun}
          disabled={!isValid || isRunning}
          className="w-full py-3.5 px-6 bg-ink text-cream font-sans font-medium rounded-xl transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink-soft flex items-center justify-center gap-3 text-base"
        >
          {isRunning ? (
            <>
              <svg className="animate-spin w-4 h-4 text-cream" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Running evaluation...
            </>
          ) : (
            'Run Evaluation'
          )}
        </button>
        {!isValid && !isRunning && (
          <p className="text-xs text-ink-faint text-center mt-2">
            Add a name, prompt template, at least one model and one test case to run.
          </p>
        )}
      </div>
    </div>
  )
}
