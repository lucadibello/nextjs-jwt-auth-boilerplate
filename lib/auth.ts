import { generateToken, verifyToken } from './jwt'

import bcrypt from 'bcrypt'
import { UserSession } from './types/auth'

export const generateAccessToken = (payload: UserSession): string => {
  // If environment variable is not set, throw an error
  if (!process.env.JWT_ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not set')
  }

  return generateToken(
    payload,
    process.env.JWT_ACCESS_TOKEN_SECRET as string,
    process.env.JWT_ACCESS_TOKEN_EXPIRATION
  )
}

export const generateRefreshToken = (payload: UserSession): string => {
  // If environment variable is not set, throw an error
  if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
    throw new Error('JWT_REFRESH_TOKEN_SECRET is not set')
  }

  return generateToken(
    payload,
    process.env.JWT_REFRESH_TOKEN_SECRET as string,
    process.env.JWT_REFRESH_TOKEN_EXPIRATION
  )
}

export const isAuthenticated = (token: string) => {
  try {
    return verifyToken(token, 'secret')
  } catch (err) {
    return false
  }
}

export const verifyPassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash)
}

export const verifyAccessToken = (token: string) => {
  // If environment variable is not set, throw an error
  if (!process.env.JWT_ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not set')
  }

  return verifyToken(token, process.env.JWT_ACCESS_TOKEN_SECRET)
}
