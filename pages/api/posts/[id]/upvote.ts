import { NextApiResponse } from 'next'
import { withMiddlewares } from '../../../../middlewares'
import {
  authMiddleware,
  NextApiRequestWithUser,
} from '../../../../middlewares/auth-middleware'
import { prisma } from '../../../../lib/db'
import { PostVoteApiResponse } from './downvote'

const getCurrentUserRoute = async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<PostVoteApiResponse>
) => {
  // Access post id from request
  const { id } = req.query

  // Ensure that id is a number
  const postId = parseInt(id as string)
  if (isNaN(postId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid post id',
    })
  }

  // Check if current user has already voted for this post
  const hasVoted = await prisma.vote.findFirst({
    where: {
      postId,
      userId: req.user.id,
    },
  })

  // If user has already voted, remove the vote
  if (hasVoted) {
    // If downvoted, remove downvote
    await prisma.vote.delete({
      where: {
        id: hasVoted.id,
      },
    })

    if (hasVoted.kind == 'DOWNVOTE') {
      // If removed downvote, increment post upvote count + add upvote
      const updatedPost = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          upvotes: {
            increment: 1,
          },
          downvotes: {
            decrement: 1,
          },
        },
        include: {
          votes: {
            where: {
              userId: req.user.id,
            },
          },
        },
      })

      await prisma.vote.create({
        data: {
          kind: 'UPVOTE',
          post: {
            connect: {
              id: postId,
            },
          },
          user: {
            connect: {
              id: req.user.id,
            },
          },
        },
      })

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
      // If removed upvote, decrement post upvote count
      const updatedPost = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          upvotes: {
            decrement: 1,
          },
        },
        include: {
          votes: {
            where: {
              userId: req.user.id,
            },
          },
        },
      })

      // Return new downvote count
      res.status(200).json({
        success: true,
        data: {
          upvotes: updatedPost.upvotes,
          downvotes: updatedPost.downvotes,
          votes: updatedPost.votes,
        },
      })
    }
  } else {
    // Create a new vote
    await prisma.vote.create({
      data: {
        postId,
        userId: req.user.id,
        kind: 'UPVOTE',
      },
    })

    // Update post upvote counter
    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        upvotes: {
          increment: 1,
        },
      },
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

export default withMiddlewares(authMiddleware, getCurrentUserRoute)
