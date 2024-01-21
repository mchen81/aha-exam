import {createRouter} from 'next-connect';
import type {NextApiRequest, NextApiResponse} from 'next';
import UserAuthService from '@/lib/service/UserAuthService';
import ApplicationError from '@/lib/service/ApplicationError';
import {getSessionTokenFromCookie} from '@/util/http';

const router = createRouter<NextApiRequest, NextApiResponse>();

const userAuthService = UserAuthService.getInstance();

/**
 * @swagger
 * /api/user/reset-password:
 *   post:
 *     tags:
 *       - user
 *     description: Returns the hello world
 *     responses:
 *       200:
 *         description: User's account info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/user-account-info'
 */

router.post(async (req, res) => {
  const sessionToken = getSessionTokenFromCookie(req);
  if (typeof sessionToken !== 'string') {
    res.status(401).json({error: 'Unauthorized'});
    return;
  }
  const {oldPassword, newPassword} = req.body;
  if (typeof oldPassword !== 'string' || typeof newPassword !== 'string') {
    res.status(400).json({error: 'Missing old or new password'});
    return;
  }

  const user = await userAuthService.getUserBySessionToken(sessionToken);
  await userAuthService.resetPassword(user.email, oldPassword, newPassword);

  res.status(200).json({});
});

export default router.handler({
  onError: (err: unknown, req: NextApiRequest, res: NextApiResponse) => {
    if (err instanceof ApplicationError) {
      res.status(err.code).json({error: err.message});
    } else {
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
    }
  },
});
