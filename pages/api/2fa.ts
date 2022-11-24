// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiResponse } from 'next'
import { withMiddlewares } from '../../middlewares'
import { prisma } from '../../lib/db'
import { LoginApiResponse } from '../login/login'
import {
  authMiddleware,
  NextApiRequestWithUser,
} from '../../middlewares/auth-middleware'

const twoFactorAuthRoute = async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<LoginApiResponse>
) => {
  // Extract email and password from request body
  const { token } = req.body as { token: string }

  // If email or password is not present, return a 400 response
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Missing email or password',
    })
  }

  // Now, look for user in db
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
  })

  // If user does not exist, return a 401 response
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    })
  }

  if (user.twoFactorToken == token) {
    // token is valid, clear twoFactorToken
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        twoFactorToken: null,
      },
    })

    // return success
    return res.status(200).json({
      success: true,
      message: 'Two factor authentication successful',
    })
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid two factor token',
    })
  }
}

export default withMiddlewares(authMiddleware, twoFactorAuthRoute)
