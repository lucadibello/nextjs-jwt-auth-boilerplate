type User = {
  id: number
  name: string
  surname: string
  email: string
  password: string
  role: string
  refreshToken: string
}

export type UserSession = Omit<User, 'password' | 'refreshToken'>
