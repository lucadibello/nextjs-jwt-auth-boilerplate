/**
 * This library is used to generate confirmation tokens needed for certain actions.
 */

import { sign, verify } from 'jsonwebtoken'
import { UserSession } from './types/auth'

export const generateToken = <T extends Object | string>(
  payload: T,
  secret: string,
  expiresIn: string | number | undefined
) => {
  return sign(payload, secret, {
    expiresIn,
  })
}

export const verifyToken = (
  token: string,
  secret: string
): Promise<UserSession> => {
  return new Promise((resolve, reject) => {
    verify(token, secret, (err, decoded) => {
      if (err || !decoded) {
        return reject(err)
      }
      const userDecoded = decoded as UserSession
      // Now, convert decoded to UserSession by removing additional properties
      const userSession: UserSession = {
        id: userDecoded.id,
        email: userDecoded.email,
        role: userDecoded.role,
        name: userDecoded.name,
        surname: userDecoded.surname,
      }
      resolve(userSession)
    })
  })
}
