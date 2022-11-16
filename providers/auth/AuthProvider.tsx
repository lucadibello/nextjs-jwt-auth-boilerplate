import { createContext, useContext, useEffect, useState } from 'react'
import { UserSession } from '../../lib/types/auth'
import { LoginApiResponse } from '../../pages/login/login'

interface AuthContextData {
  isAuthenticated: boolean
  currentUser: UserSession | null
  logIn: (_data: LoginData) => Promise<void>
  signOut: () => void
}

interface AuthProviderProps {
  children: React.ReactNode
}

const AuthContext = createContext<AuthContextData>({
  isAuthenticated: false,
  currentUser: null,
  logIn: () => Promise.resolve(),
  signOut: () => {},
})

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // try to get user from local storage
    const user = localStorage.getItem('currentUser')
    if (user) {
      setCurrentUser(JSON.parse(user) as UserSession)
      setIsAuthenticated(true)
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

  const signOut = () => {
    // Remove tokens
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie =
      'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

    // Remove user from state
    setCurrentUser(null)
    setIsAuthenticated(false)

    // Remove user data from local storage
    localStorage.removeItem('currentUser')
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        logIn,
        signOut,
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
