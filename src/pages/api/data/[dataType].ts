import {createRouter} from 'next-connect';
import type {NextApiRequest, NextApiResponse} from 'next';
import UserAccountService from '@/lib/service/UserAccountService';
import ApplicationError from '@/lib/service/ApplicationError';

import {getSessionTokenFromCookie} from '@/util/http';

const router = createRouter<NextApiRequest, NextApiResponse>();

const userAccountService = UserAccountService.getInstance();

/**
 * @swagger
 * /api/data/userLoginInfo:
 *   get:
 *     tags:
 *       - data
 *     summary: Retrieve user login information for the Dashboard
 *     description: Returns user signup timestamps, login counts, and last session timestamps for each user.
 *     responses:
 *       '200':
 *         description: User's account information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/user-db-data'
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
 *
 * /api/data/userStatistics:
 *   get:
 *     tags:
 *       - data
 *     summary: Retrieve user statistics data for the Dashboard
 *     description: Returns timestamp of user sign up, number of times logged in, and timestamp of the last user session for each user.
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Timezone offset, default is -8 (UTC+8).
 *     responses:
 *       '200':
 *         description: User's account statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/user-statistic'
 *       '400':
 *         description: The timezone offset is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error-response'
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

async function processUserLoginInfo(res: NextApiResponse) {
  const userLoginInfo = await userAccountService.getAllUsersLoginInfo();
  res.status(200).json(userLoginInfo);
}

async function processUserStatistics(res: NextApiResponse, offset: number) {
  const userCountCall = userAccountService.getUserCount();
  const activeUserTodayCall = userAccountService.getActiveUserToday(offset);
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
