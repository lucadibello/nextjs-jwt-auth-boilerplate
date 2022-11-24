import { GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { verifyAccessToken } from "../lib/auth"
import { prisma } from "../lib/db"


const redirectToLogin = {
  redirect: {
    destination: '/login',
    permanent: false,
  },
}

export type AuthOptions = {
  redirectTo?: string
  twoFactorEnabled?: boolean
}

// Create a getServerSideProps utility function called "withAuth" to check user
const withAuth = async <T extends Object = any>({ req }: GetServerSidePropsContext, onSuccess: () => Promise<GetServerSidePropsResult<T>>, options: AuthOptions = {
  redirectTo: '/login',
  twoFactorEnabled: true,
}): Promise<GetServerSidePropsResult<T>> => {
  // Get the user's session based on the request
  if (req.cookies.token) 
  {
    // Get token from cookie
    const token = req.cookies.token.split(' ')[0]

    // Dececode user token and get user data
    return verifyAccessToken(token).then(async decoded => {
      // Now, check if user has done 2 factor authentication
      const user = await prisma.user.findUnique({
        where: {
          id: decoded.id 
        }
      })
      
      // If user has not done 2 factor authentication, redirect to 2 factor authentication page
      if (!user) {
        return redirectToLogin
      } else if (options.twoFactorEnabled && user.emailToken) {
        return redirectToLogin
      } else {
        // If user has done 2 factor authentication, call onSuccess function
        return onSuccess()
      }
    }).catch(err => {
      console.log(err)
      return redirectToLogin
    })
  } else {
    return redirectToLogin
  }
}

export default withAuth