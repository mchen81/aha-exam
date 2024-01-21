import type {NextApiRequest, NextApiResponse} from 'next';
import UserAuthService from '@/lib/service/UserAuthService';
import ApplicationError from '@/lib/service/ApplicationError';
import {createRouter} from 'next-connect';
import {sendVerificationEmail} from '@/util/email';
import {generateEmailVerificationToken} from '@/util/jwt';

const userAuthService = UserAuthService.getInstance();
const router = createRouter<NextApiRequest, NextApiResponse>();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - auth
 *     summary: Register a new user
 *     description: Use this endpoint to register a new user by providing email and password
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
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating a bad request, e.g., invalid input.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating an internal server error.
 *
 */

router.post(async (req, res) => {
  const {email, password} = req.body;

  await userAuthService.registerUserByPassword(email, password);
  const token = await generateEmailVerificationToken(email);
  await sendVerificationEmail(email, token);

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
