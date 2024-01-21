import {createRouter} from 'next-connect';
import type {NextApiRequest, NextApiResponse} from 'next';
import UserAccountService from '@/lib/service/UserAccountService';
import ApplicationError from '@/lib/service/ApplicationError';

import {getSessionTokenFromCookie} from '@/util/http';

const router = createRouter<NextApiRequest, NextApiResponse>();

const userAccountService = UserAccountService.getInstance();

router.post(async (req, res) => {
  const sessionToken = getSessionTokenFromCookie(req);
  if (sessionToken === null) {
    res.status(401).json({error: 'Unauthorized'});
    return;
  }

  const dataType = req.query.dataType;

  if (dataType === 'userLoginInfo') {
    await processUserLoginInfo(res);
  } else if (dataType === 'userStatistics') {
    await processUserStatistics(res);
  } else {
    res.status(400).json({
      error: 'Invalid data type',
    });
  }
});

async function processUserLoginInfo(res: NextApiResponse) {
  const userLoginInfo = await userAccountService.getAllUsersLoginInfo();
  res.status(200).json(userLoginInfo);
}

async function processUserStatistics(res: NextApiResponse) {
  const userCountCall = userAccountService.getUserCount();
  const activeUserInDayCall = userAccountService.getActiveUserInDay();
  const averageActiveSessionUsersCall =
    userAccountService.getAverageActiveSessionUsers();
  await Promise.all([
    userCountCall,
    activeUserInDayCall,
    averageActiveSessionUsersCall,
  ]).then(([userCount, activeUserInDay, averageActiveSessionUsers]) => {
    res.status(200).json({
      userCount,
      activeUserInDay,
      averageActiveSessionUsers,
    });
  });
}

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
