// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  token: string
  refreshToken: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Data>>
) {
  // Extract email and password from request body
  const { email, password } = req.body

  // If email or password is not present, return a 400 response
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Missing email or password',
    })
  }

  // Success
  return res.status(200).json({
    success: true,
  })

  // If email or password is incorrect, return a 401 response
}
