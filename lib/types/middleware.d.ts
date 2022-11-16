export type Middleware = <T extends ApiResponse<T>>(
  _req: NextApiRequestWithUser,
  _res: NextApiResponse<T>,
  _next?: Middleware
) => void | NextApiResponse<T>
