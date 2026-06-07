'use client'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

type StampProps = {
  teacherId: 'lulu' | 'yichi'
  animate?: boolean
}

const STAMP_LABELS: Record<string, string[]> = {
  lulu: ['盧盧老師', '已批閱'],
  yichi: ['怡琪老師', '已批閱'],
}

export default function Stamp({ teacherId, animate = false }: StampProps) {
  const [visible, setVisible] = useState(!animate)
  const label = STAMP_LABELS[teacherId]

  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setVisible(true), 80)
      return () => clearTimeout(t)
    }
  }, [animate])

  return (
    <div
      className={clsx(
        'inline-flex flex-col items-center justify-center',
        'w-24 h-24 rounded-full border-4 border-red-700',
        'text-red-700 font-bold text-sm leading-tight text-center',
        '-rotate-12 select-none',
        visible ? (animate ? 'animate-stamp' : 'opacity-85') : 'opacity-0',
        'transition-opacity'
      )}
      style={{
        fontFamily: "'Noto Serif TC', serif",
        boxShadow: 'inset 0 0 0 2px #c0392b44',
        letterSpacing: '0.08em',
      }}
    >
      <span className="text-lg leading-none mb-0.5">✦</span>
      {label.map((line, i) => (
        <span key={i} className="leading-tight">{line}</span>
      ))}
      <span className="text-lg leading-none mt-0.5">✦</span>
    </div>
  )
}
