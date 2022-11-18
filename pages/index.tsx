import {
  Box,
  Divider,
  Heading,
  HStack,
  IconButton,
  Text,
  Tooltip,
  useToast,
} from '@chakra-ui/react'
import { InferGetServerSidePropsType, NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { FiRefreshCcw } from 'react-icons/fi'
import useSWR, { SWRConfig } from 'swr'
import CopyButton from '../components/CopyButton'
import Navbar from '../components/Navbar'
import NavbarProfile from '../components/NavbarProfile'
import { useAuth } from '../providers/auth/AuthProvider'

import { prisma } from '../lib/db'
import PostLibrary from '../components/PostLibrary'
import { PostsApiResponse } from './api/posts'
import fetcher from '../util/fetcher'

export async function getServerSideProps() {
  // `getStaticProps` is executed on the server side.
  const posts = await prisma.post.findMany()

  // Little workaround to get NextJS to convert Dates into JSON
  const postsJson = JSON.parse(JSON.stringify(posts))

  const postsApiResponse: PostsApiResponse = {
    success: true,
    data: {
      posts: postsJson,
    },
  }

  return {
    props: {
      fallback: {
        '/api/posts': postsApiResponse, // Empty array if error while fetching data
      },
    },
  }
}

const HomePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ fallback }) => {
  const [isTokenRefreshing, setIsTokenRefreshing] = useState(false)

  const {
    currentUser,
    logOut,
    refreshSession,
    isAuthenticated,
    accessToken,
    refreshToken,
  } = useAuth()
  const router = useRouter()
  const toast = useToast()

  // Fetch posts using SWR
  const {
    data: posts,
    error,
    mutate,
  } = useSWR<PostsApiResponse>('/api/posts', fetcher)

  return (
    <SWRConfig value={{ fallback }}>
      <Navbar
        homeURL="/"
        rightComponent={
          currentUser && [
            <NavbarProfile
              currentUser={currentUser}
              onLogOut={() => {
                // log out
                logOut()
                // redirect to home page
                router.push('/')
              }}
              key="avatar"
            />,
          ]
        }
      />
      <Box marginTop={'60px'} p={6}>
        <Heading>Your profile</Heading>
        <Divider mb={5} />
        {currentUser ? (
          <>
            <HStack>
              <Text fontWeight={'bold'}>User ID</Text>
              <Text>{currentUser.id}</Text>
            </HStack>
            <HStack>
              <Text fontWeight={'bold'}>Authenticated?</Text>
              <Text>{isAuthenticated ? 'Yes' : 'No'}</Text>
            </HStack>
            <HStack>
              <Text fontWeight={'bold'}>Username:</Text>
              <Text>
                {currentUser.name} {currentUser.surname}
              </Text>
            </HStack>
            <HStack>
              <Text fontWeight={'bold'}>Email:</Text>
              <Text>{currentUser.email}</Text>
            </HStack>
            <HStack>
              <Text fontWeight={'bold'}>Admin:</Text>
              <Text>{currentUser.role == 'ADMIN' ? 'Yes' : 'No'}</Text>
            </HStack>
            <Heading mt={5}>JWT tokens:</Heading>
            <Divider mb={5} />
            <HStack mt={5} gap={10}>
              <Text fontWeight={'bold'}>Access token:</Text>
              <Text maxWidth={'60%'}>{accessToken}</Text>
              {accessToken && (
                <CopyButton
                  value={accessToken}
                  label={'Copy access token'}
                  onSuccessfulCopy={() => {
                    toast({
                      title: 'Copied access token',
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    })
                  }}
                  onFailedCopy={() => {
                    toast({
                      title: 'Failed to copy access token',
                      status: 'error',
                      duration: 3000,
                      isClosable: true,
                    })
                  }}
                />
              )}

              <Tooltip
                hasArrow
                shouldWrapChildren
                label={'Refresh access token'}
              >
                <IconButton
                  aria-label="Refresh access token"
                  icon={<FiRefreshCcw />}
                  disabled={isTokenRefreshing}
                  onClick={() => {
                    setIsTokenRefreshing(true)
                    refreshSession()
                      .then(() => {
                        toast({
                          title: 'Refreshed access token',
                          status: 'success',
                          duration: 3000,
                          isClosable: true,
                        })
                      })
                      .catch(() => {
                        toast({
                          title: 'Failed to refresh access token',
                          status: 'error',
                          duration: 3000,
                          isClosable: true,
                        })
                      })
                      .finally(() => setIsTokenRefreshing(false))
                  }}
                />
              </Tooltip>
            </HStack>
            <HStack mt={5} gap={10}>
              <Text fontWeight={'bold'}>Refresh token:</Text>
              <Text maxWidth={'60%'}>{refreshToken}</Text>

              {refreshToken && (
                <CopyButton
                  value={refreshToken}
                  label={'Copy refresh token'}
                  onSuccessfulCopy={() => {
                    toast({
                      title: 'Copied refresh token',
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    })
                  }}
                  onFailedCopy={() => {
                    toast({
                      title: 'Failed to copy refresh token',
                      status: 'error',
                      duration: 3000,
                      isClosable: true,
                    })
                  }}
                />
              )}
            </HStack>
          </>
        ) : (
          <Text fontSize="xl">You are not logged in</Text>
        )}

        <Heading mt={5}>Tesing - Post voting</Heading>
        <Divider mb={5} />
        <Text>
          Please, like or dislike the posts below. The data is persisted in the
          DB.
        </Text>

        {/* show library of available posts */}
        <Box>
          <PostLibrary
            posts={posts}
            isLoading={!posts}
            error={error}
            mutate={mutate}
            onVoteError={error => {
              toast({
                title: 'Failed to vote',
                description: (error || '').toString(),
                status: 'error',
                duration: 3000,
                isClosable: true,
              })
            }}
          />
        </Box>
      </Box>
    </SWRConfig>
  )
}

export default HomePage
