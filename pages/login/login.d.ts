import { UserSession } from '../../lib/auth'
import { ApiResponse } from '../../lib/types/api'

export type LoginApiResponse = ApiResponse<{
  token: string
  refreshToken: string
  session: UserSession
}>

export type RefreshApiResponse = ApiResponse<{
  token: string
}>
