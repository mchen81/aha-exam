import type {NextApiRequest, NextApiResponse} from 'next';
import ApplicationError from '@/lib/service/ApplicationError';
import UserAuthService from '@/lib/service/UserAuthService';
import {createRouter} from 'next-connect';
import {getSessionTokenFromCookie, setCookieForSession} from '@/util/http';

const router = createRouter<NextApiRequest, NextApiResponse>();
const userAuthService = UserAuthService.getInstance();

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - auth
 *     summary: Logout a user
 *     description: Use this endpoint to log out a user and invalidate their session.
 *     responses:
 *       '200':
 *         description: User logged out successfully
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error-response'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error-response'
 */

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
      res.status(err.code).json({error: err.message});
    } else {
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
    }
  },
});
