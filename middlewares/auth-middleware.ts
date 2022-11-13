import { JwtPayload } from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../lib/jwt'
import { UserSession } from '../lib/types/auth'

export type NextApiRequestWithUser = NextApiRequest & {
  user: UserSession
}

// middleware.ts
export const authMiddleware: Middleware = async <T extends ApiResponse<T>>(
  req: NextApiRequestWithUser,
  res: NextApiResponse<T>,
  next?: Middleware
) => {
  // check if user has token in Authorization header
  const token = (req.headers.authorization as string).split(' ')[1]

  // if not, return 401
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Missing token',
    } as T)
  }

  // Check if access token is valid
  try {
    const decoded = verifyToken(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET as string
    ) as JwtPayload

    // Remove properties that are not defined in UserSession
    const session: UserSession = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
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
