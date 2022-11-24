import { Alert, AlertDescription, AlertIcon, AlertTitle, Flex } from "@chakra-ui/react"
import { GetServerSidePropsContext, InferGetServerSidePropsType, NextPage } from "next"
import { useRouter } from "next/router"
import { verifyTwoFactorToken } from "../lib/auth"
import { prisma } from "../lib/db"
import withAuth from "../util/withAuth"

type AvailableStatus = "success" | "error" | "info"

export const getServerSideProps = (context: GetServerSidePropsContext) => withAuth<{
  validationState: AvailableStatus
}>(context, async () => {
  if (!context.query.token) {
    return {
      props: {
        validationState: "info",
      },
    }
  } else {
    // Now extract user from token
    return verifyTwoFactorToken(context.query.token as string).then(async decoded => {
      // Now, check if user has the same two factor code
      const user = await prisma.user.findUnique({
        where: {
          id: decoded.id,
        }
      })

      // If user has the same two factor code, then we can log them in
      if (user && user.emailToken === (context.query.token as string)) {

        // Update user's email token
        await prisma.user.update({
          where: {
            id: decoded.id,
          },
          data: {
            emailToken: null,
          }
        })

        return {
          props: {
            validationState: "success" as AvailableStatus,
          },
        }
      } else {
        return {
          props: {
            validationState: "error" as AvailableStatus,
          },
        }
      }
    }).catch(() => {
      return {
        props: {
          validationState: "error" as AvailableStatus,
        },
      }
    })
  }
}, {
  twoFactorEnabled: false
})

const TwoFactor: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ validationState }) => {
  const router = useRouter()
  if (validationState == 'info') {
    return (
      <Flex h="100vh" w="100vw" justifyContent={"center"} alignItems="center">
        <Alert
          status='info'
          variant='subtle'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          textAlign='center'
          height='200px'
        >
          <AlertIcon boxSize='40px' mr={0} />
          <AlertTitle mt={4} mb={1} fontSize='lg'>
            Two Factor Authentication
          </AlertTitle>
          <AlertDescription maxWidth='sm'>
            Please, check your email for the two factor authentication link and click on it to continue.
          </AlertDescription>
        </Alert>
      </Flex>
    )
  } else if (validationState == 'success') {

    // Redirect to dashboard after 5 seconds
    setTimeout(() => {
      router.push('/')
    }, 5000)

    return (
      <Flex h="100vh" w="100vw" justifyContent={"center"} alignItems="center">
        <Alert
          status='success'
          variant='subtle'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          textAlign='center'
          height='200px'
        >
          <AlertIcon boxSize='40px' mr={0} />
          <AlertTitle mt={4} mb={1} fontSize='lg'>
            Two Factor Authentication
          </AlertTitle>
          <AlertDescription maxWidth='sm'>
            You have been successfully authenticated. You will be redirected to the home page in a few seconds.
          </AlertDescription>
        </Alert>
      </Flex>
    )
  } else if (validationState == 'error') {
    return (
      <Flex h="100vh" w="100vw" justifyContent={"center"} alignItems="center">
        <Alert
          status='error'
          variant='subtle'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          textAlign='center'
          height='200px'
        >
          <AlertIcon boxSize='40px' mr={0} />
          <AlertTitle mt={4} mb={1} fontSize='lg'>
            Two Factor Authentication
          </AlertTitle>
          <AlertDescription maxWidth='sm'>
            This link is invalid or has expired. Please, log in again to get a new link.
          </AlertDescription>
        </Alert>
      </Flex>
    )
  } else {
    return (
      <Flex h="100vh" w="100vw" justifyContent={"center"} alignItems="center">
        <Alert
          status='error'
          variant='subtle'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          textAlign='center'
          height='200px'
        >
          <AlertIcon boxSize='40px' mr={0} />
          <AlertTitle mt={4} mb={1} fontSize='lg'>
            Two Factor Authentication
          </AlertTitle>
          <AlertDescription maxWidth='sm'>
            Wrong response from server. Please, try again.
          </AlertDescription>
        </Alert>
      </Flex>
    )
  }
}

export default TwoFactor