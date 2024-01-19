import {createRouter} from 'next-connect';
import type {NextApiRequest, NextApiResponse} from 'next';
import UserAuthService from '@/lib/service/UserAuthService';
import {generateEmailVerificationToken} from '@/util/jwt';
import {getSessionTokenFromCookie} from '@/util/http';
import {sendVerificationEmail} from '@/util/email';

const router = createRouter<NextApiRequest, NextApiResponse>();

const userAuthService = UserAuthService.getInstance();

router.post(async (req, res) => {
  const sessionToken = getSessionTokenFromCookie(req);
  if (sessionToken === null) {
    return res.status(401).json({message: 'Unauthorized'});
  }

  const user = await userAuthService.getUserBySessionToken(sessionToken);

  const token = await generateEmailVerificationToken(user.email);
  sendVerificationEmail(user.email, token);

  return res.json({message: 'SUCCESS'});
});

export default router.handler();
