import { NextApiResponse } from 'next'
import { withMiddlewares } from '../../../../middlewares'
import {
  authMiddleware,
  NextApiRequestWithUser,
} from '../../../../middlewares/auth-middleware'
import { prisma } from '../../../../lib/db'
import { ApiResponse } from '../../../../lib/types/api'
import { Vote } from '@prisma/client'

export type PostVoteApiResponse = ApiResponse<{
  upvotes: number
  downvotes: number
  votes: Vote[]
}>

const clearVotes = async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<PostVoteApiResponse>
) => {
  if (req.user.role == 'ADMIN') {
    await prisma.vote.deleteMany({
      where: {
        postId: parseInt(req.query.id as string),
      },
    })

    await prisma.post.update({
      where: {
        id: parseInt(req.query.id as string),
      },
      data: {
        upvotes: 0,
        downvotes: 0,
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Votes cleared',
    })
  } else {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    })
  }
}

export default withMiddlewares(authMiddleware, clearVotes)
