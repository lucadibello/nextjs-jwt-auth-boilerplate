import { UserSession } from '../../lib/auth'

type LoginApiResponse = ApiResponse<{
  token: string
  refreshToken: string
  session: UserSession
}>
