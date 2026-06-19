import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  const emailIdx = process.argv.indexOf('--email')
  const passwordIdx = process.argv.indexOf('--password')
  const email = process.argv[emailIdx + 1]
  const password = process.argv[passwordIdx + 1]

  if (!email || !password || emailIdx === -1 || passwordIdx === -1) {
    console.error(
      'Usage: npx tsx prisma/seed.ts --email <email> --password <password>'
    )
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const admin = await db.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  })

  console.log(`✓ Admin account ready: ${admin.email}`)
}

main().finally(() => db.$disconnect())
