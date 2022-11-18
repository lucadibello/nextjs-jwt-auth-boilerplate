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

const votePostById = async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<PostVoteApiResponse>
) => {
  // Access post id from request
  const { id } = req.query

  // Load kind from request body
  const { kind } = req.body

  // Ensure that id is a number
  const postId = parseInt(id as string)
  if (isNaN(postId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid post id',
    })
  }

  // Now validate the kind
  if (kind !== 'UPVOTE' && kind !== 'DOWNVOTE') {
    return res.status(400).json({
      success: false,
      message: 'Invalid vote kind',
    })
  }

  // Check if current user has already voted for this post
  const hasVoted = await prisma.vote.findFirst({
    where: {
      postId,
      userId: req.user.id,
    },
  })

  console.log('HASVOTED: ', hasVoted)

  // If user has already voted, remove the vote
  if (hasVoted) {
    // Clear every vote for this post
    await prisma.vote.delete({
      where: {
        id: hasVoted.id,
      },
    })

    // Check if user is removing the same vote
    let data = undefined
    if (hasVoted.kind === kind) {
      if (kind == 'UPVOTE') {
        data = {
          upvotes: {
            decrement: 1,
          },
        }
      } else {
        data = {
          downvotes: {
            decrement: 1,
          },
        }
      }
    } else {
      if (kind == 'UPVOTE') {
        data = {
          upvotes: {
            increment: 1,
          },
          downvotes: {
            decrement: 1,
          },
        }
      } else {
        data = {
          upvotes: {
            decrement: 1,
          },
          downvotes: {
            increment: 1,
          },
        }
      }

      // Created related vote
      await prisma.vote.create({
        data: {
          kind,
          postId,
          userId: req.user.id,
        },
      })
    }

    console.log('DATA: ', data)

    // If removed downvote, increment post upvote count + add upvote
    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data,
      include: {
        votes: {
          where: {
            userId: req.user.id,
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      data: {
        upvotes: updatedPost.upvotes,
        downvotes: updatedPost.downvotes,
        votes: updatedPost.votes,
      },
    })
  } else {
    let data = undefined
    if (kind == 'UPVOTE') {
      data = {
        upvotes: {
          increment: 1,
        },
      }
    } else {
      data = {
        downvotes: {
          increment: 1,
        },
      }
    }

    // Create a new vote
    await prisma.vote.create({
      data: {
        postId,
        userId: req.user.id,
        kind,
      },
    })

    // Update post upvote counter
    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data,
      include: {
        votes: {
          where: {
            userId: req.user.id,
          },
        },
      },
    })

    if (updatedPost) {
      // Return new downvote count
      res.status(200).json({
        success: true,
        data: {
          upvotes: updatedPost.upvotes,
          downvotes: updatedPost.downvotes,
          votes: updatedPost.votes,
        },
      })
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unable to update post upvotes',
      })
    }
  }
}

export default withMiddlewares(authMiddleware, votePostById)
