import ApplicationError from './ApplicationError'
import { UserAccount, UserAuthentication, UserSession } from '@/db/model'
import { type UserAccountDataType } from '@/types/user'

let instance: UserAccountService
class UserAccountService {
  static getInstance (): UserAccountService {
    if (instance === undefined) {
      instance = new UserAccountService()
    }
    return instance
  }

  async getUserByEmail (email: string): Promise<UserAccountDataType | null> {
    const user = await UserAccount.findOne({
      where: {
        email
      },
      include: [{
        model: UserAuthentication
      },
      {
        model: UserSession,
        where: {
          isActive: true
        }
      }
      ]
    })

    if (user === null) {
      return null
    }

    let isVerified: boolean = true
    const userAuth = user.UserAuthentications[0]
    if (userAuth.provider === 'local' && !userAuth.isVerified) {
      isVerified = false
    }

    let lastLoginAt: Date | null = null
    for (const session of user.UserSessions) {
      if (lastLoginAt === null) {
        lastLoginAt = session.createdAt
      } else if (session.createdAt > lastLoginAt) {
        lastLoginAt = session.createdAt
      }
    }

    if (lastLoginAt === null) {
      throw new ApplicationError(500, 'User last session not found')
    }

    return {
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      createdAt: user.createdAt,
      isVerified,
      provider: userAuth.provider,
      lastLoginAt
    }
  }
}

export default UserAccountService
