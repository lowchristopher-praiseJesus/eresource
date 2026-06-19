import { describe, it, expect } from 'vitest'
import { slugify, getFileUrl } from '@/lib/utils'

describe('slugify', () => {
  it('lowercases and hyphenates a string', () => {
    expect(slugify('Sunday Morning Sermon')).toBe('sunday-morning-sermon')
  })

  it('collapses multiple spaces and special characters', () => {
    expect(slugify('God\'s  Grace & Mercy!')).toBe('god-s-grace-mercy')
  })

  it('strips leading and trailing hyphens', () => {
    expect(slugify('  hello  ')).toBe('hello')
  })
})

describe('getFileUrl', () => {
  it('prepends R2_PUBLIC_URL to a key', () => {
    process.env.R2_PUBLIC_URL = 'https://pub-abc.r2.dev'
    expect(getFileUrl('uploads/sermon.mp4')).toBe(
      'https://pub-abc.r2.dev/uploads/sermon.mp4'
    )
  })
})
