import ApplicationError from './ApplicationError'
import { UserAccount, UserAuthentication } from '@/db/model'
import sequelize from '@/db/sequelize'
import { isValidPassword } from '@/util/validation'

interface GoogleAuthProfile {
  email: string
  name: string
  avatar: string
}

class UserAccountService {
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

    const hashedPassword = hash(password)

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

  async registerUserByGoogle (profile: GoogleAuthProfile) {
    const existingGoogleUser = await UserAccount.findOne({
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

    if (existingGoogleUser != null) {
      return existingGoogleUser
    } else {
      return await sequelize.transaction(async t => {
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
  }

  async loginByPassword (email: string, password: string) {
    // TODO
  }

  async loginByGoogle () {
    // TODO OAUTH 2.0 implementation
  }

  async logoutUser (session: string) {
    // TODO
  }

  async resetPassword (email: string, oldPassword: string, newPassword: string) {
    // TODO
  }
}

function hash (password: string) {
  // TODO use hash utils
  return password
}

export default new UserAccountService()
