import { Prisma } from '@prisma/client'
import bcrypt from 'bcrypt'
import { prisma } from '../lib/db'

const seed = async () => {
  const password = await bcrypt.hash('password', 10)

  try {
    const data: Prisma.UserCreateArgs['data'][] = [
      {
        name: 'Luca',
        surname: 'Di Bello',
        email: 'info@lucadibello.ch',
        password: password,
        role: 'ADMIN',
      },
    ]

    console.log('Seeding users...')

    // Create the default users
    prisma.user
      .createMany({
        data,
      })
      .then(() => {
        console.log('[!] Database users seeded')
      })
      .catch(error => {
        console.log('[!] Error seeding database users', error)
      })
  } catch (error) {
    console.warn('Please define your seed data.')
    console.error(error)
  }
}

seed()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
