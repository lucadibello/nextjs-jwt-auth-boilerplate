import { UserSession } from '../../lib/auth'

export type LoginApiResponse = ApiResponse<{
  token: string
  refreshToken: string
  session: UserSession
}>

export type RefreshApiResponse = ApiResponse<{
  token: string
}>
