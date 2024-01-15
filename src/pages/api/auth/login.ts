import type { NextApiRequest, NextApiResponse } from 'next'
import ApplicationError from '@/lib/service/ApplicationError'
import UserAuthService from '@/lib/service/UserAuthService'
import { createRouter } from 'next-connect'
import { setCookieForSession } from '@/util/http'

const router = createRouter<NextApiRequest, NextApiResponse>()
const userAuthService = UserAuthService.getInstance()
router.post(async (req, res, next) => {
  const { email, password } = req.body
  const loginResult = await userAuthService.loginByPassword(email, password)
  setCookieForSession(res, loginResult.sessionToken)
  res.status(200).json({})
})

export default router.handler({
  onError: (err: any, req: any, res: any) => {
    if (err instanceof ApplicationError) {
      res.status(400).json({ error: err.message })
    } else {
      console.log(err)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
})
