import {createRouter} from 'next-connect';
import type {NextApiRequest, NextApiResponse} from 'next';
import UserAccountService from '@/lib/service/UserAccountService';
import UserAuthService from '@/lib/service/UserAuthService';

import {getSessionTokenFromCookie} from '@/util/http';

const router = createRouter<NextApiRequest, NextApiResponse>();

const userAccountService = UserAccountService.getInstance();
const userAuthService = UserAuthService.getInstance();

router.get(async (req, res) => {
  const sessionToken = getSessionTokenFromCookie(req);
  if (sessionToken === null) {
    res.status(401).json({message: 'Unauthorized'});
    return;
  }

  const user = await userAuthService.getUserBySessionToken(sessionToken);

  const result = await userAccountService.getUserByEmail(user.email);

  res.json(result);
});

export default router.handler();
