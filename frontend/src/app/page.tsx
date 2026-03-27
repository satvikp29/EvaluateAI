'use client'

import { useState } from 'react'
import EvalSetup from '@/components/EvalSetup'
import ResultsPanel from '@/components/ResultsPanel'
import HistorySidebar from '@/components/HistorySidebar'
import { EvalResult } from '@/lib/api'

export default function Home() {
  const [result, setResult] = useState<EvalResult | null>(null)
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)

  const handleResult = (evalResult: EvalResult) => {
    setResult(evalResult)
    setHistoryRefreshKey((k) => k + 1)
  }

  const handleBack = () => {
    setResult(null)
  }

  const handleLoadFromHistory = (evalResult: EvalResult) => {
    setResult(evalResult)
  }

  return (
    <main className="flex h-screen overflow-hidden bg-cream">
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {result ? (
          <ResultsPanel result={result} onBack={handleBack} />
        ) : (
          <EvalSetup onResult={handleResult} />
        )}
      </div>

      {/* Sidebar */}
      <HistorySidebar
        onLoadResult={handleLoadFromHistory}
        refreshKey={historyRefreshKey}
      />
    </main>
  )
}
