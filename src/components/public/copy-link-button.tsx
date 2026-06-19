'use client'

import { useState } from 'react'
import { Link as LinkIcon, Check } from 'lucide-react'

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable — silent fail
    }
  }

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? 'Link copied' : 'Copy link to this resource'}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors text-slate-700"
    >
      {copied
        ? <Check className="h-4 w-4 text-green-600" />
        : <LinkIcon className="h-4 w-4" />
      }
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  )
}
