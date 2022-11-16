import { NextApiResponse } from 'next'
import { verifyToken } from '../../lib/jwt'
import { prisma } from '../../lib/db'
import { withMiddlewares } from '../../middlewares'
import {
  authMiddleware,
  NextApiRequestWithUser,
} from '../../middlewares/auth-middleware'
import { generateAccessToken } from '../../lib/auth'
import { ApiResponse } from '../../lib/types/api'
import { UserSession } from '../../lib/types/auth'

type Data = {
  token: string
}

const refreshRoute = async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<ApiResponse<Data>>
) => {
  // Read refresh token from cookies
  const refreshToken =
    req.cookies && req.cookies.refreshToken
      ? req.cookies.refreshToken.split(' ')[0]
      : null

  // If refresh token is not present, return a 400 response
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Missing refresh token',
    })
  }

  // Ok, decode JWT to get user infos
  try {
    const decoded = await verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET as string
    )

    // Check if refresh token is valid
    if (decoded) {
      // Now compare refresh token and access token to see if they match
      if (decoded.id === req.user.id && decoded.email === req.user.email) {
        // If they match, check if refresh token exists in database + is assigned to specified user
        const user = await prisma.user.findFirst({
          where: {
            id: req.user.id,
            email: req.user.email,
          },
        })

        // If user does not exist, return a 401 response
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Invalid refresh token',
          })
        } else if (user.refreshToken != refreshToken) {
          // If refresh token does not match, return a 401 response
          return res.status(401).json({
            success: false,
            message: 'Refresh token mismatch',
          })
        } else {
          const session: UserSession = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            surname: user.surname,
          }

          // If user exists, generate new access token
          const token = generateAccessToken(session)

          // return new access token
          return res.status(200).json({
            success: true,
            data: {
              token,
            },
          })
        }
      }
    } else {
      // Trigger error manually
      throw new Error('Invalid refresh token')
    }
  } catch {
    // If they don't match, return a 401 response
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    })
  }
}

export default withMiddlewares(authMiddleware, refreshRoute)
