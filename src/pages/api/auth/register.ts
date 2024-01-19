import type {NextApiRequest, NextApiResponse} from 'next';
import UserAuthService from '@/lib/service/UserAuthService';
import ApplicationError from '@/lib/service/ApplicationError';
import {createRouter} from 'next-connect';
import {sendVerificationEmail} from '@/util/email';
import {generateEmailVerificationToken} from '@/util/jwt';

const userAuthService = UserAuthService.getInstance();
const router = createRouter<NextApiRequest, NextApiResponse>();

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
      res.status(400).json({error: err.message});
    } else {
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
    }
  },
});
