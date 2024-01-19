import config from '@/util/config';
import jsonwebtoken, {JsonWebTokenError} from 'jsonwebtoken';
import ApplicationError from '../service/ApplicationError';

const emailAuthSecret = config.emailAuthSecret;

interface TokenPayload {
  email: string;
  iat: number;
  exp: number;
  iss: string;
}

export async function generateEmailVerificationToken(
  email: string
): Promise<string> {
  return jsonwebtoken.sign({email}, emailAuthSecret, {
    expiresIn: '1h',
    issuer: 'JerryChen',
  });
}

export async function verifyEmailVerificationToken(
  token: string
): Promise<TokenPayload> {
  try {
    const payload = jsonwebtoken.verify(token, emailAuthSecret);
    return payload as TokenPayload;
  } catch (err) {
    if (err instanceof JsonWebTokenError) {
      throw new ApplicationError(400, err.message);
    } else {
      throw new ApplicationError(
        500,
        'An error occurs while verifying the token, please contact the administrator'
      );
    }
  }
}
