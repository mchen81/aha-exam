import {createRouter} from 'next-connect';
import type {NextApiRequest, NextApiResponse} from 'next';
import UserAuthService from '@/lib/service/UserAuthService';
import {generateEmailVerificationToken} from '@/util/jwt';
import {getSessionTokenFromCookie} from '@/util/http';
import {sendVerificationEmail} from '@/util/email';
import ApplicationError from '@/lib/service/ApplicationError';

const router = createRouter<NextApiRequest, NextApiResponse>();

const userAuthService = UserAuthService.getInstance();

/**
 * @swagger
 * /api/user/resend-verify-email:
 *   post:
 *     tags:
 *       - auth
 *     summary: Resend Verify email
 *     description: If user's doesn't have the verify email, send a verification email again
 *     responses:
 *       200:
 *         description: the verification email has been resent
 *       400:
 *         description: user email has been verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error-response'
 *       401:
 *         description: session token is invliad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error-response'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error-response'
 */

router.post(async (req, res) => {
  const sessionToken = getSessionTokenFromCookie(req);
  if (sessionToken === null) {
    return res.status(401).json({error: 'Unauthorized'});
  }

  const user = await userAuthService.getUserBySessionToken(sessionToken);
  if (user.isVerified) {
    return res.status(400).json({error: 'Email already verified'});
  }

  const token = await generateEmailVerificationToken(user.email);
  await sendVerificationEmail(user.email, token);

  return res.json({});
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
