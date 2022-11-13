// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { withMiddlewares } from '../../middlewares'
import { prisma } from '../../lib/db'
import * as auth from '../../lib/auth'

type Data = {
  token: string
  refreshToken: string
}

const loginRoute = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Data>>
) => {
  // Extract email and password from request body
  const { email, password } = req.body as { email: string; password: string }

  // If email or password is not present, return a 400 response
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Missing email or password',
    })
  }

  // Check if user exists in database
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  // If user does not exist, return a 401 response
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    })
  } else {
    // If user exists, check if password is correct using auth lib
    if (await auth.verifyPassword(password, user.password)) {
      // generate access and refresh token
      const token = auth.generateAccessToken(user)
      const refreshToken = auth.generateRefreshToken(user)

      // save refresh token to database
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          refreshToken,
        },
      })

      // return access and refresh token
      return res.status(200).json({
        success: true,
        data: {
          token,
          refreshToken,
        },
      })
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }
  }
}

export default withMiddlewares(loginRoute)
