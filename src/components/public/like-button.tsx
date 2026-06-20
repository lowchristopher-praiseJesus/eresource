'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'

interface LikeButtonProps {
  resourceId: string
  initialCount: number
}

export function LikeButton({ resourceId, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      setLiked(localStorage.getItem(`liked:${resourceId}`) === '1')
    } catch {
      // localStorage unavailable (private mode etc.) — ignore
    }
  }, [resourceId])

  async function handleLike() {
    if (liked || loading) return
    setLiked(true)
    setCount(c => c + 1)
    try {
      localStorage.setItem(`liked:${resourceId}`, '1')
    } catch { /* ignore */ }
    setLoading(true)
    try {
      const res = await fetch(`/api/resources/${resourceId}/like`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json() as { likeCount: number }
        setCount(data.likeCount)
      }
    } catch {
      // Network error — keep optimistic state
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={liked}
      aria-label={liked ? 'Liked' : 'Like this resource'}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors min-w-fit ${
        liked
          ? 'border-rose-200 bg-rose-50 text-rose-600 cursor-default'
          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
      }`}
    >
      <Heart
        className={`h-4 w-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`}
      />
      {count}
    </button>
  )
}
