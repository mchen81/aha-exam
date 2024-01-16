import type {NextApiRequest, NextApiResponse} from 'next';
import ApplicationError from '@/lib/service/ApplicationError';
import UserAuthService from '@/lib/service/UserAuthService';
import {createRouter} from 'next-connect';
import {getSessionTokenFromCookie, setCookieForSession} from '@/util/http';

const router = createRouter<NextApiRequest, NextApiResponse>();
const userAuthService = UserAuthService.getInstance();
router.post(async (req, res) => {
  const sessionToken = getSessionTokenFromCookie(req);
  if (sessionToken === null) {
    res.status(401).json({error: 'Unauthorized'});
    return;
  }
  await userAuthService.logoutUser(sessionToken);
  setCookieForSession(res, '');
  res.status(200).json({});
});
export default router.handler({
  onError: (err: unknown, req: NextApiRequest, res: NextApiResponse) => {
    if (err instanceof ApplicationError) {
      res.status(400).json({error: err.message});
    } else {
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
    }
  },
});
