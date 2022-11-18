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

  useEffect(() => {
    if (!currentUser) {
      // try to get user from local storage
      const user = localStorage.getItem('currentUser')
      if (user != null && user !== 'undefined') {
        setCurrentUser(JSON.parse(user) as UserSession)
        setIsAuthenticated(true)
      }
    }

    if (!accessToken) {
      // try to get access token from local storage
      const token = sessionStorage.getItem('accessToken')
      if (token != null && token !== 'undefined') {
        setAccessToken(token)
      }
    }

    if (!refreshToken) {
      // try to get refresh token from local storage
      const token = sessionStorage.getItem('refreshToken')
      if (token != null && token !== 'undefined') {
        setRefreshToken(token)
      }
    }
  }, [])

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
            // save tokens inside cookie storage (secure, )
            document.cookie = `token=${res.data.token} secure`
            document.cookie = `refreshToken=${res.data.refreshToken} secure`

            // Save access token and refresh token
            setAccessToken(res.data.token)
            setRefreshToken(res.data.refreshToken)

            // save user data inside state
            setCurrentUser(res.data.session)

            // save current user in local storage
            localStorage.setItem(
              'currentUser',
              JSON.stringify(res.data.session)
            )

            // Save tokens in session storage for persistence
            sessionStorage.setItem('accessToken', res.data.token)
            sessionStorage.setItem('refreshToken', res.data.refreshToken)

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
    // Remove tokens
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie =
      'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

    // Remove user from state
    setCurrentUser(null)
    setIsAuthenticated(false)

    // Removed saved access token and refresh token
    setAccessToken('')
    setRefreshToken('')

    // Remove tokens from session storage
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('refreshToken')

    // Remove user data persistence from local storage
    localStorage.removeItem('currentUser')
  }

  const refreshSession = async () => {
    // Send API request to refresh endpoint
    return new Promise<void>((resolve, reject) => {
      fetch('/api/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(res => res.json() as Promise<RefreshApiResponse>)
        .then(res => {
          if (res.success && res.data) {
            // Overwrite current token with new one
            document.cookie = `token=${res.data.token} secure`

            // Refresh access token
            setAccessToken(res.data.token)

            // Update session storage
            sessionStorage.setItem('accessToken', res.data.token)

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
