import ApplicationError from './ApplicationError';
import {UserAccount, UserAuthentication, UserSession} from '@/db/model';
import {type UserAccountDataType, type LoginInfo} from '@/types/user';
import sequelize from 'sequelize';
import _ from 'lodash';

let instance: UserAccountService;

class UserAccountService {
  static getInstance(): UserAccountService {
    if (instance === undefined) {
      instance = new UserAccountService();
    }
    return instance;
  }

  async getUserByEmail(email: string): Promise<UserAccountDataType | null> {
    const user = await UserAccount.findOne({
      where: {
        email,
      },
      include: [
        {
          model: UserAuthentication,
        },
        {
          model: UserSession,
          where: {
            isActive: true,
          },
        },
      ],
    });

    if (user === null) {
      return null;
    }

    let isVerified: boolean = true;
    const userAuth = user.UserAuthentications[0];
    if (userAuth.provider === 'local' && !userAuth.isVerified) {
      isVerified = false;
    }

    let lastLoginAt: Date | null = null;
    for (const session of user.UserSessions) {
      if (lastLoginAt === null) {
        lastLoginAt = session.createdAt;
      } else if (session.createdAt > lastLoginAt) {
        lastLoginAt = session.createdAt;
      }
    }

    if (lastLoginAt === null) {
      throw new ApplicationError(500, 'User last session not found');
    }

    return {
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      createdAt: user.createdAt,
      isVerified,
      provider: userAuth.provider,
      lastLoginAt,
    };
  }

  async updateUsername(email: string, username: string): Promise<string> {
    if (_.isEmpty(username)) {
      throw new ApplicationError(400, 'User name cannot be empty');
    }

    const user = await UserAccount.findOne({
      where: {
        email,
      },
    });

    if (user === null) {
      throw new ApplicationError(404, 'User not found');
    }

    user.username = username;
    await user.save();

    return username;
  }

  async getAllUsersLoginInfo(): Promise<LoginInfo[]> {
    const result = (await UserAccount.findAll({
      attributes: [
        [sequelize.col('UserAccount.email'), 'email'],
        [sequelize.col('UserAccount.created_at'), 'signupTimestamp'], // Timestamp of user sign up
        [sequelize.fn('COUNT', sequelize.col('UserSessions.id')), 'loginCount'], // Number of times logged in
        [
          sequelize.fn('MAX', sequelize.col('UserSessions.created_at')),
          'lastSessionTimestamp',
        ], // Timestamp of the last user session
      ],
      include: [
        {
          model: UserSession,
          attributes: [],
          required: false, // Use LEFT JOIN to include all users even if they have no sessions
        },
      ],
      group: ['UserAccount.id'], // Group by user account to get counts per user
      raw: true, // Return raw data
    })) as unknown;

    return result as LoginInfo[];
  }

  async getUserCount(): Promise<number> {
    const reuslt = await UserAccount.count();
    return reuslt;
  }

  async getActiveUserInDay() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await UserSession.findAndCountAll({
      distinct: true, // Count only unique users
      where: {
        isActive: true,
        createdAt: {
          [sequelize.Op.gte]: today, // Sessions created today
        },
      },
    })
      .then(({count}) => {
        return count;
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  async getAverageActiveSessionUsers(rollingDays: number = 7) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - rollingDays);
    const reuslt: number = await UserSession.findAndCountAll({
      distinct: true, // Count only unique users
      where: {
        isActive: true,
        createdAt: {
          [sequelize.Op.gte]: sevenDaysAgo, // Sessions created in the last 7 days
        },
      },
    }).then(({count}) => {
      return count;
    });

    return reuslt / rollingDays;
  }
}

export default UserAccountService;
