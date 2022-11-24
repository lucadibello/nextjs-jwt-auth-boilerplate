import { generateToken, verifyToken } from './jwt'

import bcrypt from 'bcrypt'
import { UserSession } from './types/auth'

export const generateAccessToken = (payload: UserSession): string => {
  // If environment variable is not set, throw an error
  if (!process.env.JWT_ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not set')
  }

  if (!process.env.JWT_ACCESS_TOKEN_EXPIRATION) {
    throw new Error('ACCESS_TOKEN_EXPIRATION is not set')
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

  if (!process.env.JWT_REFRESH_TOKEN_EXPIRATION) {
    throw new Error('JWT_REFRESH_TOKEN_EXPIRATION is not set')
  }

  return generateToken(
    payload,
    process.env.JWT_REFRESH_TOKEN_SECRET as string,
    process.env.JWT_REFRESH_TOKEN_EXPIRATION
  )
}

export const generateTwoFactorToken = (payload: UserSession): string => {
  // If environment variable is not set, throw an error
  if (!process.env.JWT_TWO_FACTOR_TOKEN_SECRET) {
    throw new Error('JWT_TWO_FACTOR_TOKEN_SECRET is not set')
  }

  if (!process.env.JWT_TWO_FACTOR_TOKEN_EXPIRATION) {
    throw new Error('JWT_TWO_FACTOR_TOKEN_EXPIRATION is not set')
  }

  return generateToken(
    payload,
    process.env.JWT_TWO_FACTOR_TOKEN_SECRET as string,
    process.env.JWT_TWO_FACTOR_TOKEN_EXPIRATION
  )
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

export const verifyTwoFactorToken = (token: string) => {
  // If environment variable is not set, throw an error
  if (!process.env.JWT_TWO_FACTOR_TOKEN_SECRET) {
    throw new Error('JWT_TWO_FACTOR_TOKEN_SECRET is not set')
  }

  return verifyToken(token, process.env.JWT_TWO_FACTOR_TOKEN_SECRET)
}
