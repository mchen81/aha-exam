import { type CookieSerializeOptions, serialize } from 'cookie'
import { type NextApiResponse, type NextApiRequest } from 'next'

export const SESSION_KEY = 'session_token'

const defaultCookieOptions: CookieSerializeOptions = {
  path: '/',
  httpOnly: true,
  maxAge: 60 * 60 * 24,
  secure: true,
  sameSite: 'none'
}

export const setCookieForSession = (
  res: NextApiResponse,
  sessionToken: string,
  options: CookieSerializeOptions = defaultCookieOptions
): void => {
  res.setHeader('Set-Cookie', serialize(SESSION_KEY, sessionToken, options))
}

// export const verifyAndGetUserSessionToken = (req: NextApiRequest): string | null => {
//
//
// }
