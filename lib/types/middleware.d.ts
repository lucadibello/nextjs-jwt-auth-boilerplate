type Middleware = <T extends ApiResponse<T>>(
  req: NextApiRequestWithUser,
  res: NextApiResponse<T>,
  next?: Middleware
) => void | NextApiResponse<T>
