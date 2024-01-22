import {createRouter} from 'next-connect';
import type {NextApiRequest, NextApiResponse} from 'next';
import UserAccountService from '@/lib/service/UserAccountService';
import ApplicationError from '@/lib/service/ApplicationError';

import {getSessionTokenFromCookie} from '@/util/http';

const router = createRouter<NextApiRequest, NextApiResponse>();

const userAccountService = UserAccountService.getInstance();

router.get(async (req, res) => {
  const sessionToken = getSessionTokenFromCookie(req);
  if (sessionToken === null) {
    res.status(401).json({error: 'Unauthorized'});
    return;
  }
  const dataType = req.query.dataType;

  if (dataType === 'userLoginInfo') {
    await processUserLoginInfo(res);
  } else if (dataType === 'userStatistics') {
    const offsetStr = (req.query.offset as string) ?? '-8'; // default to Taiwanese offset
    const offset = parseInt(offsetStr, 10);
    if (isNaN(offset) || offset > 12 || offset < -14) {
      throw new ApplicationError(
        400,
        'Offset must be an integer between -14(UTC+14) and 12(UTC-12)'
      );
    }

    await processUserStatistics(res, offset);
  } else {
    res.status(400).json({
      error: 'Invalid data type',
    });
  }
});

/**
 * @swagger
 * /api/data/userLoginInfo:
 *   get:
 *     tags:
 *       - data
 *     summary: The user db data for Dashboard
 *     description: Returns timestamp of user sign up, number of times logged in, iimestamp of the last user session for each user
 *     responses:
 *       200:
 *         description: User's account info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/user-db-data'
 */
async function processUserLoginInfo(res: NextApiResponse) {
  const userLoginInfo = await userAccountService.getAllUsersLoginInfo();
  res.status(200).json(userLoginInfo);
}

/**
 * @swagger
 * /api/data/userStatistics:
 *   get:
 *     tags:
 *       - data
 *     summary: The user statistics data for Dashboard
 *     description: Returns timestamp of user sign up, number of times logged in, iimestamp of the last user session for each user
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: timezone offset, default by -8 ( = UTC+8)
 *     responses:
 *       200:
 *         description: User's account info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/user-statistic'
 */
async function processUserStatistics(res: NextApiResponse, offset: number) {
  const userCountCall = userAccountService.getUserCount();
  const activeUserTodayCall = userAccountService.getActiveUserToday();
  const averageActiveSessionUsersCall =
    userAccountService.getAverageActiveSessionUserCount(7, offset);
  await Promise.all([
    userCountCall,
    activeUserTodayCall,
    averageActiveSessionUsersCall,
  ]).then(([userCount, activeUserToday, averageActiveSessionUsers]) => {
    res.status(200).json({
      userCount,
      activeUserToday,
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
