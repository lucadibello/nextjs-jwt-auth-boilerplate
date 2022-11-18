import { Prisma } from '@prisma/client'
import bcrypt from 'bcrypt'
import { prisma } from '../lib/db'

const seed = async () => {
  const password = await bcrypt.hash('password', 10)

  try {
    const data: Prisma.UserCreateArgs['data'][] = [
      {
        id: 1,
        name: 'John',
        surname: 'Rossi',
        email: 'user@lucadibello.ch',
        password: password,
        role: 'USER',
      },
      {
        id: 2,
        name: 'Jane',
        surname: 'White',
        email: 'admin@lucadibello.ch',
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

  console.log('Seeding posts...')
  try {
    // Generate random dates
    const randomDate = (start: Date, end: Date) => {
      return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
      )
    }

    // Create posts
    const data: Prisma.PostCreateArgs['data'][] = [
      {
        title: 'Cute dogs',
        content: 'This is a post about cute dogs, come and see them!',
        imageUrl:
          'https://images.unsplash.com/photo-1534361960057-19889db9621e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200',
        createdAt: randomDate(new Date(2020, 0, 1), new Date()),
      },
      {
        title: 'Cute cats',
        content: 'This is a post about cute cats, come and see them!',
        imageUrl:
          'https://images.unsplash.com/photo-1555008872-f03b347ffb53?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80',
        createdAt: randomDate(new Date(2020, 0, 1), new Date()),
      },
    ]

    // Create the default users
    prisma.post
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
