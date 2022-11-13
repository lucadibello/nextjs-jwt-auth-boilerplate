import { generateToken, verifyToken } from './jwt'

export const generateAccessToken = (payload: UserSession): string => {
  // If environment variable is not set, throw an error
  if (!process.env.ACCESS_TOKEN_SECRET) {
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
    const verified = verifyToken(token, 'secret')
    return verified
  } catch (err) {
    return false
  }
}
