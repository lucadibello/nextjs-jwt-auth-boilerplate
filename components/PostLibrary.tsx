import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Text,
  HStack,
  Spinner,
  Box,
  Heading,
  Stack,
  Button,
  Code,
  IconButton,
} from '@chakra-ui/react'
import { Post, Vote } from '@prisma/client'

import { Card, CardBody, CardFooter } from '@chakra-ui/card'
import { PostsApiResponse, PostWithVote } from '../pages/api/posts'
import Image from 'next/image'
import { FiArrowDown, FiArrowUp, FiTrash } from 'react-icons/fi'
import { KeyedMutator } from 'swr'
import { memo, useMemo } from 'react'
import { PostVoteApiResponse } from '../pages/api/posts/[id]/vote'
import { useAuth } from '../providers/auth/AuthProvider'

interface IPostLibraryProps {
  posts?: PostsApiResponse
  isLoading: boolean
  error: Error
  mutate: KeyedMutator<PostsApiResponse>
  onVoteError: (_error?: Error | string) => void
}

const PostCard = ({
  post,
  onUpvote,
  onDownvote,
  onClear,
}: {
  post: PostWithVote
  onUpvote: () => void
  onDownvote: () => void
  onClear: () => void
}) => {
  const { currentUser } = useAuth()

  // check if post is upvoted by current user
  const isUpvoted = useMemo(() => {
    return post.votes.some(vote => vote.kind === 'UPVOTE')
  }, [post])

  // check if post is downvoted by current user
  const isDownvoted = useMemo(() => {
    return post.votes.some(vote => vote.kind === 'DOWNVOTE')
  }, [post])

  return (
    <Card
      direction={{ base: 'column', sm: 'row' }}
      overflow="hidden"
      variant="outline"
      bgColor={'gray.50'}
    >
      <Image
        alt={post.title}
        src={post.imageUrl}
        width={1000}
        height={1000}
        style={{
          maxWidth: '200px',
          height: 'auto',
        }}
      />

      <Stack p={5}>
        <CardBody py={2}>
          <HStack>
            <Heading size="md">{post.title}</Heading>
            {/* Show creation date */}
            <Text fontSize="md" color="gray.500">
              {new Date(post.createdAt).toLocaleString()}
            </Text>
          </HStack>

          <Text py="2">{post.content}</Text>
        </CardBody>

        <CardFooter>
          {/* Upvote and downvote buttons */}
          <HStack>
            {/* button with left icon */}
            <Button
              leftIcon={<FiArrowUp />}
              variant="outline"
              size="sm"
              onClick={onUpvote}
              colorScheme={isUpvoted ? 'green' : undefined}
            >
              {post.upvotes}
            </Button>

            {/* button with left icon */}
            <Button
              leftIcon={<FiArrowDown />}
              variant="outline"
              size="sm"
              onClick={onDownvote}
              colorScheme={isDownvoted ? 'red' : undefined}
            >
              {post.downvotes > 0 ? '-' + post.downvotes : 0}
            </Button>

            {/* Clear votes */}
            <IconButton
              aria-label="Clear votes"
              icon={<FiTrash />}
              size="sm"
              variant="outline"
              isDisabled={currentUser?.role !== 'ADMIN'}
              onClick={onClear}
            />
          </HStack>
        </CardFooter>
      </Stack>
    </Card>
  )
}

const MemoizedPost = memo(PostCard, (prevProps, nextProps) => {
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.votes.length === nextProps.post.votes.length &&
    prevProps.post.upvotes === nextProps.post.upvotes &&
    prevProps.post.downvotes === nextProps.post.downvotes
  )
})

const updatePostsInfo = (
  posts: PostWithVote[],
  target: Post,
  updatedUpvotes: number,
  updatedDownvotes: number,
  updatedVotes: Vote[]
) => {
  // Update the posts data in the cache
  return posts.map(p => {
    if (p.id === target.id) {
      return {
        ...p,
        upvotes: updatedUpvotes,
        downvotes: updatedDownvotes,
        votes: updatedVotes,
      }
    }
    return p
  })
}

const PostLibrary = ({
  posts,
  isLoading,
  error,
  mutate,
  onVoteError,
}: IPostLibraryProps) => {
  const onVote = (post: Post, kind: 'UPVOTE' | 'DOWNVOTE') => {
    // Send API request to /api/posts/[id]/downvote
    fetch(`/api/posts/${post.id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        kind,
      }),
    })
      .then(res => res.json() as Promise<PostVoteApiResponse>)
      .then(res => {
        if (res.success) {
          if (res.data?.upvotes && res.data?.votes && posts?.data) {
            mutate({
              success: true,
              data: {
                posts: updatePostsInfo(
                  posts.data.posts,
                  post,
                  res.data.downvotes,
                  res.data.upvotes,
                  res.data.votes
                ),
              },
            })
          } else {
            mutate()
          }
        } else {
          onVoteError(res.message)
        }
      })
      .catch(err => onVoteError(err))
  }

  const onClear = (post: Post) => {
    fetch(`/api/posts/${post.id}/clear`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => {
      if (res.ok) {
        // mutate posts
        mutate()
      } else {
        onVoteError('Failed to clear votes, are you admin?')
      }
    })
  }

  if (isLoading || !posts) {
    return (
      <HStack>
        <Spinner />
        <Text>Loading ...</Text>
      </HStack>
    )
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>
          There was an error while fetching posts. Please, retry again later.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Box>
      {posts.data?.posts.length ? (
        <Stack>
          {posts.data.posts.map(post => (
            <MemoizedPost
              key={post.id}
              post={post}
              onDownvote={() => onVote(post, 'DOWNVOTE')}
              onUpvote={() => onVote(post, 'UPVOTE')}
              onClear={() => onClear(post)}
            />
          ))}
        </Stack>
      ) : (
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>No posts!</AlertTitle>
          <AlertDescription>
            Unfornutely, seems like there are no posts yet. Please, paste this
            command inside your terminal: <Code>yarn prisma db seed</Code>
          </AlertDescription>
        </Alert>
      )}
    </Box>
  )
}

export default PostLibrary
