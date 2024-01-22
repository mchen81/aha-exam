import ApplicationError from './ApplicationError';
import {UserAccount, UserAuthentication, UserSession} from '@/db/model';
import sequelize from '@/db/sequelize';
import {isValidEmail, isValidPassword} from '@/util/validation';
import bcrypt from 'bcrypt';
import randomstring from 'randomstring';

import type {LoginResult} from '@/types/auth';
import type {UserAccountDataType} from '@/types/user';

interface GoogleAuthProfile {
  email: string;
  name: string;
  avatar?: string;
}

const SALT_ROUND = 10;

let instance: UserAuthService;

class UserAuthService {
  static getInstance(): UserAuthService {
    if (instance === undefined) {
      instance = new UserAuthService();
    }
    return instance;
  }

  /**
   * Register a new user by email and password.
   *
   * @param {string} email - The email of the user.
   * @param {string} password - The password of the user.
   * @returns {Promise<void>}
   * @throws {ApplicationError} If the email is invalid, the password does not meet the requirements, or the user already exists.
   */
  async registerUserByPassword(email: string, password: string): Promise<void> {
    if (!isValidEmail(email)) {
      throw new ApplicationError(400, 'Invalid Email');
    }

    if (!isValidPassword(password)) {
      throw new ApplicationError(
        400,
        'Password does not meet the requirements'
      );
    }

    const existingUser = await UserAccount.findOne({
      where: {
        email,
      },
    });

    if (existingUser !== null) {
      throw new ApplicationError(400, 'User already exists');
    }

    const hashedPassword = bcrypt.hashSync(password, SALT_ROUND);

    await sequelize.transaction(async t => {
      const user = await UserAccount.create(
        {
          email,
          createdAt: new Date(),
        },
        {transaction: t}
      );

      await UserAuthentication.create(
        {
          userId: user.id,
          provider: 'local',
          authentication: hashedPassword,
          isVerified: false,
          createdAt: new Date(),
        },
        {transaction: t}
      );

      return user;
    });
  }

  /**
   * Create or fina a user by google oauth2 profile.
   * @param {GoogleAuthProfile} profile extraced from google oauth2
   * @returns {Promise<LoginResult>}
   * @throws {ApplicationError} If use has been registered with password before
   */
  async registerOrLoginUserByGoogle(
    profile: GoogleAuthProfile
  ): Promise<LoginResult> {
    let user: UserAccount | null = await UserAccount.findOne({
      where: {
        email: profile.email,
      },
      include: [
        {
          model: UserAuthentication,
        },
      ],
    });

    const userAuth = user?.UserAuthentications[0] ?? null;

    if (userAuth !== null && userAuth.provider !== 'google') {
      throw new ApplicationError(
        400,
        'This user is not linked with Google, please login with email/password'
      );
    }

    if (user === null) {
      user = await sequelize.transaction(async t => {
        const [user] = await UserAccount.findOrCreate({
          where: {
            email: profile.email,
          },
          defaults: {
            email: profile.email,
            avatar: profile.avatar,
            username: profile.name,
            createdAt: new Date(),
          },
          transaction: t,
        });

        await UserAuthentication.create(
          {
            userId: user.id,
            provider: 'google',
            authentication: profile.email,
            isVerified: true,
            createdAt: new Date(),
          },
          {transaction: t}
        );

        return user;
      });
    }

    const sessionToken = generationSessionToken();
    await UserSession.create({
      userId: user.id,
      sessionToken,
      isActive: true,
      createdAt: new Date(),
    });

    return {
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      sessionToken,
      provider: 'google',
      isVerified: true,
    };
  }

  /**
   * User login with email and password.
   * @param email
   * @param password
   * @returns {Promise<LoginResult>}
   * @throws {ApplicationError} If the given user credentials are invalid.
   */
  async loginByPassword(email: string, password: string): Promise<LoginResult> {
    const user = await UserAccount.findOne({
      where: {
        email,
      },
      include: [
        {
          model: UserAuthentication,
          where: {
            provider: 'local',
          },
          required: true,
        },
      ],
    });

    if (user === null) {
      throw new ApplicationError(400, 'User not found');
    }

    const userAuth: UserAuthentication = user.UserAuthentications[0];
    const isMatched: boolean = bcrypt.compareSync(
      password,
      userAuth.authentication
    );

    if (!isMatched) {
      throw new ApplicationError(400, 'Incorrect password');
    }

    const sessionToken = generationSessionToken();

    await UserSession.create({
      userId: user.id,
      sessionToken,
      isActive: true,
      createdAt: new Date(),
    });

    return {
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      sessionToken,
      provider: 'local',
      isVerified: userAuth.isVerified,
    };
  }

  /**
   * Deactivate the geven session
   * @param sessionToken
   * @throws {ApplicationError} If the sessiopn token is invalid.
   */
  async logoutUser(sessionToken: string): Promise<void> {
    const userSession = await UserSession.findOne({
      where: {
        sessionToken,
      },
    });

    if (userSession === null) {
      throw new ApplicationError(400, 'Session not found');
    }

    userSession.isActive = false;
    await userSession.save();
  }

  /**
   * Reset user's password
   * @param email
   * @param oldPassword
   * @param newPassword
   * @throws {ApplicationError} If the given user credentials are invalid.
   */
  async resetPassword(
    email: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    if (!isValidPassword(newPassword)) {
      throw new ApplicationError(
        400,
        'New Password does not meet the requirements'
      );
    }

    const user = await UserAccount.findOne({
      where: {
        email,
      },
      include: [
        {
          model: UserAuthentication,
          where: {
            provider: 'local',
          },
          required: true,
        },
      ],
    });

    if (user === null) {
      throw new ApplicationError(
        400,
        'Your account is not registered with password credentials'
      );
    }

    const userAuth: UserAuthentication = user.UserAuthentications[0];
    if (!bcrypt.compareSync(oldPassword, userAuth.authentication)) {
      throw new ApplicationError(400, 'Incorrect password');
    }

    userAuth.authentication = bcrypt.hashSync(newPassword, SALT_ROUND);
    await userAuth.save();
  }

  /**
   * When user makes a request, get user's data from the database.
   * @param sessionToken
   * @returns {Promise<UserAccountDataType>}
   */
  async getUserBySessionToken(
    sessionToken: string
  ): Promise<UserAccountDataType> {
    if (sessionToken === null || sessionToken === undefined) {
      throw new ApplicationError(400, 'Session token is not provided');
    }

    const userSession = await UserSession.findOne({
      where: {
        sessionToken,
      },
    });

    if (userSession === null) {
      throw new ApplicationError(400, 'Session not found');
    }

    if (!userSession.isActive) {
      throw new ApplicationError(400, 'Session is not active');
    }

    const user = await UserAccount.findOne({
      where: {id: userSession.userId},
      include: [
        {
          model: UserAuthentication,
        },
      ],
    });

    if (user === null) {
      throw new ApplicationError(400, 'User not found');
    }

    const userAuth = user.UserAuthentications[0];

    return {
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      createdAt: user.createdAt,
      isVerified: userAuth.isVerified,
      provider: userAuth.provider,
    };
  }

  /**
   * turn the user's isVerified flag to true
   * @param email
   * @returns {Promise<UserAccount>}
   * @throws {ApplicationError} when user not found
   */
  async verifyUserEmail(email: string): Promise<UserAccount> {
    const user = await UserAccount.findOne({
      where: {
        email,
      },
      include: [
        {
          model: UserAuthentication,
          where: {
            provider: 'local',
          },
          required: true,
        },
      ],
    });

    if (user === null) {
      throw new ApplicationError(400, 'User not found');
    }

    const userAuth: UserAuthentication = user.UserAuthentications[0];
    if (userAuth.isVerified) {
      return user;
    }

    userAuth.isVerified = true;
    await userAuth.save();

    return user;
  }

  /**
   * This method is used when user clicks the verfiy link through email, a session is issued so that the user does not have to login again.
   * @param userId user's databse id
   * @returns {string} session token
   */
  async createSessionForAuthenticatedUser(userId: number): Promise<string> {
    const sessionToken = generationSessionToken();

    await UserSession.create({
      userId: userId,
      sessionToken,
      isActive: true,
      createdAt: new Date(),
    });

    return sessionToken;
  }
}

function generationSessionToken(length = 200): string {
  return randomstring.generate({
    length: length,
    charset: 'alphanumeric',
  });
}

export default UserAuthService;
