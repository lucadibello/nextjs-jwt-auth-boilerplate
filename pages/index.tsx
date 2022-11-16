import {
  Box,
  Divider,
  Heading,
  HStack,
  IconButton,
  Text,
  Tooltip,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { FiRefreshCcw } from 'react-icons/fi'
import CopyButton from '../components/CopyButton'
import Navbar from '../components/Navbar'
import NavbarProfile from '../components/NavbarProfile'
import { useAuth } from '../providers/auth/AuthProvider'

const HomePage: NextPage = () => {
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
                      .then(() => console.log('DONE!'))
                      .catch(console.log)
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
