import type {NextApiRequest, NextApiResponse} from 'next';
import ApplicationError from '@/lib/service/ApplicationError';
import UserAuthService from '@/lib/service/UserAuthService';
import {createRouter} from 'next-connect';
import {setCookieForSession} from '@/util/http';
import _ from 'lodash';
import {isValidEmail, isValidPassword} from '@/util/validation';

const router = createRouter<NextApiRequest, NextApiResponse>();
const userAuthService = UserAuthService.getInstance();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - auth
 *     summary: Login with email and password
 *     description: Use this endpoint to authenticate a user with their email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address.
 *               password:
 *                 type: string
 *                 description: The user's password.
 *     responses:
 *       '200':
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/login-result'
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: session_token=abcde12345; Path=/; HttpOnly
 *       '400':
 *         description: Email or password are not correct
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
  const {email, password} = req.body;
  if (isValidEmail(email) || isValidPassword(password)) {
    res.status(400).json({error: 'Invalid email or password'});
    return;
  }

  const loginResult = await userAuthService.loginByPassword(email, password);
  setCookieForSession(res, loginResult.sessionToken);
  res.status(200).json({loginResult});
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
