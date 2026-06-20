import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

const INITIAL_TOPICS = [
  { order: 1, name: 'Mission Introduction & Purpose' },
  { order: 2, name: 'Spiritual Preparation' },
  { order: 3, name: 'Understanding Chiang Mai & Thailand' },
  { order: 4, name: 'Language Tips' },
  { order: 5, name: 'Practical Trip Logistics' },
  { order: 6, name: 'Health & Safety' },
  { order: 7, name: 'Ministry Focus Areas' },
  { order: 8, name: 'Post-Trip Reflection & Follow-Up' },
  { order: 9, name: 'Appendices' },
]

async function seedTopics() {
  for (const t of INITIAL_TOPICS) {
    await db.topic.upsert({
      where: { slug: slugify(t.name) },
      update: {},
      create: { name: t.name, slug: slugify(t.name), order: t.order },
    })
  }
  console.log('✓ Topics seeded')
}

async function main() {
  await seedTopics()

  const emailIdx = process.argv.indexOf('--email')
  const passwordIdx = process.argv.indexOf('--password')
  const email = process.argv[emailIdx + 1]
  const password = process.argv[passwordIdx + 1]

  if (emailIdx !== -1 && passwordIdx !== -1 && email && password) {
    const passwordHash = await bcrypt.hash(password, 12)
    const admin = await db.admin.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, passwordHash },
    })
    console.log(`✓ Admin account ready: ${admin.email}`)
  }
}

main().finally(() => db.$disconnect())
