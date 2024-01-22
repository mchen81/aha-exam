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
 *     summary: Reset User Password
 *     description: Reset the user's password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: The user's current password.
 *               newPassword:
 *                 type: string
 *                 description: The user's new password.
 *     responses:
 *       '200':
 *         description: User's account info reset successfully (No response body).
 *       '400':
 *         description: Missing old or new passwordsm or the passwords doesn't not match.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error-response'
 *       '401':
 *         description: Session token is invalid.
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
