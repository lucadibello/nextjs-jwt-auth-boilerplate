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
  Image,
} from '@chakra-ui/react'
import { Post } from '@prisma/client'

import { Card, CardBody, CardFooter } from '@chakra-ui/card'

interface IPostLibraryProps {
  posts: Post[]
  isLoading: boolean
  error: Error
  mutate: (_newPosts: Post[]) => void
}

const PostCard = ({ post }: { post: Post }) => {
  return (
    <Card
      direction={{ base: 'column', sm: 'row' }}
      overflow="hidden"
      variant="outline"
    >
      <Image
        objectFit="cover"
        maxW={{ base: '100%', sm: '200px' }}
        src="https://images.unsplash.com/photo-1667489022797-ab608913feeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw5fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60"
        alt="Caffe Latte"
      />

      <Stack>
        <CardBody>
          <Heading size="md">The perfect latte</Heading>

          <Text py="2">
            Caffè latte is a coffee beverage of Italian origin made with
            espresso and steamed milk.
          </Text>
        </CardBody>

        <CardFooter>
          <Button variant="solid" colorScheme="blue">
            Buy Latte
          </Button>
        </CardFooter>
      </Stack>
    </Card>
  )
}

const PostLibrary = ({
  posts,
  isLoading,
  error,
  mutate,
}: IPostLibraryProps) => {
  if (isLoading) {
    {
      /* Spinner */
    }
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
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </Box>
  )
}

export default PostLibrary
