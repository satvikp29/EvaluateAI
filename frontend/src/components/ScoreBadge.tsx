interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md'
}

export default function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const rounded = Math.round(score)

  let bgColor: string
  let textColor: string
  let borderColor: string

  if (rounded >= 80) {
    bgColor = 'bg-score-high-bg'
    textColor = 'text-score-high'
    borderColor = 'border-score-high'
  } else if (rounded >= 60) {
    bgColor = 'bg-score-mid-bg'
    textColor = 'text-score-mid'
    borderColor = 'border-score-mid'
  } else {
    bgColor = 'bg-score-low-bg'
    textColor = 'text-score-low'
    borderColor = 'border-score-low'
  }

  const sizeClasses = size === 'sm'
    ? 'text-xs px-1.5 py-0.5 min-w-[36px]'
    : 'text-sm px-2 py-1 min-w-[44px]'

  return (
    <span
      className={`inline-flex items-center justify-center font-mono font-medium rounded border ${bgColor} ${textColor} ${borderColor} ${sizeClasses}`}
    >
      {rounded}
    </span>
  )
}
