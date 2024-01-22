import ApplicationError from './ApplicationError';
import {UserAccount, UserAuthentication, UserSession} from '@/db/model';
import {type UserAccountDataType, type LoginInfo} from '@/types/user';
import sequelize from 'sequelize';

let instance: UserAccountService;

function toUtcOffset(offset: number): string {
  return `${offset <= 0 ? '+' : '-'}${Math.abs(offset)}:00`;
}

class UserAccountService {
  static getInstance(): UserAccountService {
    if (instance === undefined) {
      instance = new UserAccountService();
    }
    return instance;
  }

  /**
   * Get user's data by email
   * @param email user email
   * @returns User's account info or null if not found
   * @throws {ApplicationError} If the user doesn't have a session, which should be considered as a bug
   */
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

  /**
   * Update user's name
   * @param email user's identifier
   * @param username new username
   * @returns new user's name
   * @throws {ApplicationError} If the user not found
   *
   */
  async updateUsername(email: string, username: string): Promise<string> {
    const user = await UserAccount.findOne({
      where: {
        email,
      },
    });

    if (user === null) {
      throw new ApplicationError(404, 'User not found');
    }

    user.username = username ?? '';
    await user.save();

    return username;
  }

  /**
   * Get all users' LoginInfo
   * @returns {Promise<LoginInfo[]>}}
   */
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

  /**
   * Get the total number of users
   * @returns {number} the count of all users
   */
  async getUserCount(): Promise<number> {
    const reuslt = await UserAccount.count();
    return reuslt;
  }

  /**
   * Get all active user by today (with given offset)
   * The session logged in before today still counts as active as long as no logout
   *
   * @param offset -8 for UTC+8, 4 for UTC-4
   * @returns the count
   */
  async getActiveUserToday(offset: number): Promise<number> {
    const utcOffset = toUtcOffset(offset);

    /*
      SELECT COUNT(DISTINCT(UserSession.user_id)) AS 'active_users_count'
      FROM aha.user_session AS UserSession
      WHERE (DATE(CONVERT_TZ(NOW(), '+00:00', '+8:00')) >= DATE(CONVERT_TZ(UserSession.created_at, '+00:00', '+8:00')))
      AND UserSession.is_active = true;
    */
    const rows = await UserSession.findAll({
      attributes: [
        [
          sequelize.fn(
            'COUNT',
            sequelize.fn('DISTINCT', sequelize.col('user_id'))
          ),
          'active_users_count',
        ],
      ],
      where: {
        isActive: true,
        [sequelize.Op.and]: [
          sequelize.literal(
            `DATE(CONVERT_TZ(NOW(), '+00:00', '${utcOffset}')) >= DATE(CONVERT_TZ(created_at, '+00:00', '${utcOffset}'))`
          ),
        ],
      },
    });

    if (rows.length !== 1) {
      throw new ApplicationError(
        500,
        `Could not calculate active user count by today with offset ${offset}`
      );
    }

    return rows[0].get('active_users_count') as number;
  }

  /**
   * Average number of active session users in the last n days rolling
   * @param rollingDays the last n days
   * @param offset -8 for UTC+8, 4 for UTC-4
   * @returns the average count
   */
  async getAverageActiveSessionUserCount(
    rollingDays: number,
    offset: number
  ): Promise<number> {
    const utcOffset = toUtcOffset(offset);

    const today = new Date();
    today.setHours(today.getHours() - offset, 0, 0, 0);

    const nDaysAgo = new Date(today);
    nDaysAgo.setDate(nDaysAgo.getDate() - rollingDays);

    /*
      SELECT COUNT(DISTINCT(UserSession.user_id)) AS active_sessions,
             DATE(CONVERT_TZ(UserSession.created_at, '+00:00', <utcOffset> )) AS session_date
      FROM aha.user_session AS UserSession
      WHERE UserSession.is_active = true
        AND (UserSession.created_at >= CONVERT_TZ(NOW(), '+00:00', <utcOffset>) - INTERVAL <rollingDays-1> DAY
        AND  UserSession.created_at <= CONVERT_TZ(NOW(), '+00:00', <utcOffset>))
      GROUP BY session_date
    */
    const result = await UserSession.findAll({
      attributes: [
        [
          sequelize.fn(
            'COUNT',
            sequelize.fn('DISTINCT', sequelize.col('user_id'))
          ),
          'active_sessions',
        ],
        [
          sequelize.literal(
            `DATE(CONVERT_TZ(created_at, '+00:00', '${utcOffset}'))`
          ),
          'session_date',
        ],
      ],
      where: {
        isActive: true,
        createdAt: {
          [sequelize.Op.gte]: sequelize.literal(
            `CONVERT_TZ(NOW(), '+00:00', '${utcOffset}') - INTERVAL ${rollingDays} DAY`
          ),
          [sequelize.Op.lte]: sequelize.literal(
            `CONVERT_TZ(NOW(), '+00:00', '${utcOffset}')`
          ),
        },
      },
      group: ['session_date'],
    });

    const sumActiveSessions = result.reduce(
      (sum, row) => sum + (row.get('active_sessions') as number),
      0
    );

    const avgActiveSessions = sumActiveSessions / rollingDays;

    return avgActiveSessions;
  }
}

export default UserAccountService;
