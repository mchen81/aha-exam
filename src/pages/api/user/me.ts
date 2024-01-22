import {createRouter} from 'next-connect';
import type {NextApiRequest, NextApiResponse} from 'next';
import UserAccountService from '@/lib/service/UserAccountService';
import UserAuthService from '@/lib/service/UserAuthService';
import ApplicationError from '@/lib/service/ApplicationError';

import {getSessionTokenFromCookie} from '@/util/http';
import _ from 'lodash';

const router = createRouter<NextApiRequest, NextApiResponse>();

const userAccountService = UserAccountService.getInstance();
const userAuthService = UserAuthService.getInstance();

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     tags:
 *       - user
 *     description: Returns user's account information.
 *     responses:
 *       '200':
 *         description: User's account info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/user-account-info'
 *       '401':
 *         description: Unauthorized user (with invalid session token)
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
 *   put:
 *     tags:
 *       - user
 *     summary: Update user name
 *     description: Update user name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: New username provided by the user
 *     responses:
 *       '200':
 *         description: User's account info updated successfully (no response body)
 *       '401':
 *         description: Unauthorized user (with invalid session token)
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

router.get(async (req, res) => {
  const sessionToken = getSessionTokenFromCookie(req);
  if (sessionToken === null || _.isEmpty(sessionToken)) {
    res.status(401).json({error: 'Unauthorized'});
    return;
  }

  const user = await userAuthService.getUserBySessionToken(sessionToken);
  const result = await userAccountService.getUserByEmail(user.email);

  res.status(200).json(result);
});

router.put(async (req, res) => {
  const sessionToken = getSessionTokenFromCookie(req);
  if (sessionToken === null || _.isEmpty(sessionToken)) {
    res.status(401).json({error: 'Unauthorized'});
    return;
  }

  const username = req.body.username;

  const user = await userAuthService.getUserBySessionToken(sessionToken);
  await userAccountService.updateUsername(user.email, username ?? '');

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
