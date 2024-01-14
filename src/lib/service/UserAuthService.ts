import ApplicationError from './ApplicationError'
import { UserAccount, UserAuthentication, UserSession } from '@/db/model'
import sequelize from '@/db/sequelize'
import { isValidPassword } from '@/util/validation'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

interface GoogleAuthProfile {
  email: string
  name: string
  avatar: string
}

interface LoginResult {
  email: string
  username: string
  avatar: string
  sessionToken: string
  provider: string
  isVerified: boolean
}

const SALT_ROUND = 10
const SESSION_EXPIRE = 1000 * 60 * 60 * 24 * 7 // 7D

let instance: UserAuthService

class UserAuthService {
  static getInstance (): UserAuthService {
    if (instance === undefined) {
      instance = new UserAuthService()
    }
    return instance
  }

  async registerUserByPassword (email: string, password: string) {
    if (!isValidPassword(password)) {
      throw new ApplicationError(400, 'Invalid Password')
    }

    const existingUser = await UserAccount.findOne({
      where: {
        email
      }
    })

    if (existingUser != null) {
      throw new ApplicationError(400, 'User already exists')
    }

    const hashedPassword = bcrypt.hashSync(password, SALT_ROUND)
    console.log(hashedPassword)

    const user = sequelize.transaction(async t => {
      const user = await UserAccount.create({
        email,
        createdAt: new Date()
      }, { transaction: t })

      await UserAuthentication.create({
        userId: user.id,
        provider: 'local',
        authentication: hashedPassword,
        isVerified: false,
        createdAt: new Date()
      }, { transaction: t })

      return user
    })

    // TODO send verification email
  }

  async registerOrLoginUserByGoogle (profile: GoogleAuthProfile): Promise<LoginResult> {
    let googleUser: UserAccount | null = await UserAccount.findOne({
      where: {
        email: profile.email
      },
      include: [{
        model: UserAuthentication,
        where: {
          provider: 'google'
        }
      }]
    })

    if (googleUser === null) {
      googleUser = await sequelize.transaction(async t => {
        const [user] = await UserAccount.findOrCreate({
          where: {
            email: profile.email
          },
          defaults: {
            email: profile.email,
            avatar: profile.avatar,
            username: profile.name,
            createdAt: new Date()
          },
          transaction: t
        })

        await UserAuthentication.create({
          userId: user.id,
          provider: 'google',
          authentication: profile.email,
          isVerified: true,
          createdAt: new Date()
        }, { transaction: t })

        return user
      })
    }
    const sessionToken = generationSessionToken()
    await UserSession.create({
      userId: googleUser.id,
      sessionToken,
      isActive: true,
      expireAt: new Date(Date.now() + SESSION_EXPIRE),
      createdAt: new Date()
    })

    return {
      email: googleUser.email,
      username: googleUser.username,
      avatar: googleUser.avatar,
      sessionToken,
      provider: 'google',
      isVerified: true
    }
  }

  async loginByPassword (email: string, password: string): Promise<LoginResult> {
    const user = await UserAccount.findOne({
      where: {
        email
      },
      include: [{
        model: UserAuthentication,
        where: {
          provider: 'local'
        },
        required: true
      }]
    })

    if (user == null) {
      throw new ApplicationError(400, 'User not found')
    }

    const userAuth: UserAuthentication = user.UserAuthentications[0]
    const isMatched: boolean = bcrypt.compareSync(password, userAuth.authentication)

    if (!isMatched) {
      throw new ApplicationError(400, 'Incorrect password')
    }

    const sessionToken = generationSessionToken()

    await UserSession.create({
      userId: user.id,
      sessionToken,
      isActive: true,
      expireAt: new Date(Date.now() + SESSION_EXPIRE),
      createdAt: new Date()
    })

    return {
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      sessionToken,
      provider: 'local',
      isVerified: userAuth.isVerified
    }
  }

  async logoutUser (sessionToken: string): Promise<void> {
    const userSession = await UserSession.findOne({
      where: {
        sessionToken
      }
    })

    if (userSession === null) {
      throw new ApplicationError(400, 'Session not found')
    }

    userSession.isActive = false
    await userSession.save()
  }

  async resetPassword (email: string, oldPassword: string, newPassword: string): Promise<void> {
    if (!isValidPassword(newPassword)) {
      throw new ApplicationError(400, 'Invalid New Password')
    }

    const user = await UserAccount.findOne({
      where: {
        email
      },
      include: [{
        model: UserAuthentication,
        where: {
          provider: 'local'
        },
        required: true
      }]
    })

    if (user == null) {
      throw new ApplicationError(400, 'User is not registered with password credentials')
    }

    const userAuth: UserAuthentication = user.UserAuthentications[0]
    if (!bcrypt.compareSync(oldPassword, userAuth.authentication)) {
      throw new ApplicationError(400, 'Incorrect password')
    }

    userAuth.authentication = bcrypt.hashSync(newPassword, SALT_ROUND)
    await userAuth.save()
  }

  async getUserBySessionToken (sessionToken: string): Promise<any> {
    const userSession = await UserSession.findOne({
      where: {
        sessionToken
      }
    })

    if (userSession === null) {
      throw new ApplicationError(400, 'Session not found')
    }

    if (!userSession.isActive) {
      throw new ApplicationError(400, 'Session is not active')
    }

    if (userSession.expireAt <= new Date()) {
      throw new ApplicationError(400, 'Session has expired')
    }

    const user = await UserAccount.findOne({
      where: {
        id: userSession.userId
      }
    })

    if (user == null) {
      throw new ApplicationError(400, 'User not found')
    }

    return user
  }
}

function generationSessionToken (length = 48): string {
  return crypto.randomBytes(length).toString('hex')
}
export default UserAuthService
