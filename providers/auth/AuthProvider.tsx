import { createContext, useContext, useEffect, useState } from 'react'
import { UserSession } from '../../lib/types/auth'
import { LoginApiResponse, RefreshApiResponse } from '../../pages/login/login'

interface AuthContextData {
  isAuthenticated: boolean
  currentUser: UserSession | null
  accessToken: string | null
  refreshToken: string | null
  logIn: (_data: LoginData) => Promise<void>
  logOut: () => void
  refreshSession: () => Promise<void>
}

interface AuthProviderProps {
  children: React.ReactNode
}

const AuthContext = createContext<AuthContextData>({
  isAuthenticated: false,
  currentUser: null,
  accessToken: null,
  refreshToken: null,
  logIn: () => Promise.resolve(),
  logOut: () => {},
  refreshSession: () => Promise.resolve(),
})

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)

  // Watch currentUser
  useEffect(() => {
    console.log('current user changed')
    if (!currentUser) {
      // try to get user from local storage
      const user = localStorage.getItem('currentUser')
      if (user != null && user !== 'undefined') {
        setCurrentUser(JSON.parse(user) as UserSession)
        setIsAuthenticated(true)
      }
    }
  }, [currentUser])

  // Watch access token
  useEffect(() => {
    console.log('access token changed')
    if (!accessToken) {
      // Read access token from cookies
      const cookies = document.cookie.split(';')
      const tokenCookie = cookies.find(cookie => cookie.includes('token'))
      if (tokenCookie) {
        const token = tokenCookie.split('=')[1]
        setAccessToken(token)
      }
    }
  }, [accessToken])

  // Watch refresh token
  useEffect(() => {
    console.log('refresh token changed')
    if (!refreshToken) {
      // try to get refresh token from local storage
      const token = localStorage.getItem('refreshToken')
      console.log('refresh token', token)
      if (token != null && token !== 'undefined') {
        setRefreshToken(token)
      }
    }
  }, [refreshToken])

  const logIn = async (data: LoginData) => {
    return new Promise<void>((resolve, reject) => {
      // Send data to API
      fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then(res => res.json() as Promise<LoginApiResponse>)
        .then(res => {
          if (res.success && res.data) {
            // save access token in cookies
            document.cookie = `token=${res.data.token} secure`

            // Save refresh token in session storage for persistence
            localStorage.setItem('refreshToken', res.data.refreshToken)

            // Save access token and refresh token
            setRefreshToken(res.data.refreshToken)

            // save user data inside state
            setCurrentUser(res.data.session)

            // save current user in local storage
            localStorage.setItem(
              'currentUser',
              JSON.stringify(res.data.session)
            )

            // set isAuthenticated to true
            setIsAuthenticated(true)

            // set auth state
            resolve()
          } else {
            reject(new Error(res.message))
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  const logOut = () => {
    // Remove access token from cookies
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

    // Clear provider state
    setCurrentUser(null)
    setIsAuthenticated(false)
    setAccessToken('')
    setRefreshToken('')

    // Remove persistence data from local storage
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('currentUser')
  }

  const refreshSession = async () => {
    // Read refresh token from localStorage if not found in provider state
    if (!refreshToken) {
      const token = localStorage.getItem('refreshToken')
      if (token != null && token !== 'undefined') {
        setRefreshToken(token)
      } else {
        return Promise.reject(new Error('Refresh token not found'))
      }
    }

    // Send API request to refresh endpoint
    return new Promise<void>((resolve, reject) => {
      fetch('/api/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })
        .then(res => res.json() as Promise<RefreshApiResponse>)
        .then(res => {
          if (res.success && res.data) {
            // Overwrite current token with new one
            document.cookie = `token=${res.data.token} secure`

            // Refresh access token
            setAccessToken(res.data.token)

            // Refreshed correctly
            resolve()
          } else {
            reject(new Error(res.message))
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        logIn,
        logOut,
        refreshSession,
        refreshToken,
        accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

const useAuth = () => {
  // Custom hook to use auth context
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { AuthContext, AuthProvider, useAuth }
