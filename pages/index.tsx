import { Box, Divider, Heading, HStack, Text, VStack } from '@chakra-ui/react'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import NavbarProfile from '../components/NavbarProfile'
import { useAuth } from '../providers/auth/AuthProvider'

export const getServerSideProps: GetServerSideProps = async context => {
  const token = context.req.cookies['token']
  const refreshToken = context.req.cookies['refreshToken']

  if (!token || !refreshToken) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  } else {
    // return access token and refresh token
    return {
      props: {
        accessToken: context.req.cookies['token']?.split(' ')[0] || '',
        refreshToken: context.req.cookies['refreshToken']?.split(' ')[0] || '',
      },
    }
  }
}

const HomePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ accessToken, refreshToken }) => {
  const { currentUser, signOut } = useAuth()
  const router = useRouter()

  return (
    <>
      <Navbar
        homeURL="/"
        rightComponent={
          currentUser && [
            <NavbarProfile
              currentUser={currentUser}
              onLogOut={() => {
                // log out
                signOut()
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
            <HStack>
              <Text fontWeight={'bold'}>Access token:</Text>
              <Text>{accessToken}</Text>
            </HStack>
            <HStack mt={5}>
              <Text fontWeight={'bold'}>Refresh token:</Text>
              <Text>{refreshToken}</Text>
            </HStack>
          </>
        ) : (
          <Text fontSize="xl">You are not logged in</Text>
        )}

        <Heading mt={5}>Testing</Heading>
        <Divider mb={5} />
        <VStack>
          <Text>
            You can test the API by using the access token in the Authorization
            header.
          </Text>
        </VStack>
      </Box>
    </>
  )
}

export default HomePage
