import { ReactNode } from 'react'
import { AuthProvider } from './auth/AuthProvider'

const AllProviders = ({ children }: { children: ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>
}

export default AllProviders
