import {type CookieSerializeOptions, parse, serialize} from 'cookie';
import {type NextApiRequest, type NextApiResponse} from 'next';

export const SESSION_KEY = 'session_token';

const defaultCookieOptions: CookieSerializeOptions = {
  path: '/',
  httpOnly: true,
  maxAge: 60 * 60 * 24,
  secure: true,
  sameSite: 'none',
};

export const setCookieForSession = (
  res: NextApiResponse,
  sessionToken: string,
  options: CookieSerializeOptions = defaultCookieOptions
): void => {
  res.setHeader('Set-Cookie', serialize(SESSION_KEY, sessionToken, options));
};

export const getSessionTokenFromCookie = (
  req: NextApiRequest
): string | null => {
  const cookies = parse(req.headers.cookie ?? '');
  return cookies[SESSION_KEY];
};
