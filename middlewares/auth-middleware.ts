import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../lib/jwt'
import { ApiResponse } from '../lib/types/api'
import { UserSession } from '../lib/types/auth'
import { Middleware } from '../lib/types/middleware'

export type NextApiRequestWithUser = NextApiRequest & {
  user: UserSession
}

// middleware.ts
export const authMiddleware: Middleware = async <T extends ApiResponse<T>>(
  req: NextApiRequestWithUser,
  res: NextApiResponse<T>,
  next?: Middleware
) => {
  // look for access token inside cookies
  const token =
    req.cookies && req.cookies.token ? req.cookies.token.split(' ')[0] : null
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Missing token',
    } as T)
  }

  // Check if access token is valid
  try {
    const decoded = await verifyToken(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET as string
    )

    // Remove properties that are not defined in UserSession
    const session: UserSession = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      surname: decoded.surname,
      role: decoded.role,
    }

    // Add user to request
    req.user = session as UserSession

    // and call next()
    if (next) await next(req, res, undefined)

    // Else, return
    return res.status(200)
  } catch (error) {
    console.error('AUTH ERROR:', error)
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    } as T)
  }
}
