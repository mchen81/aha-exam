import type { NextApiRequest, NextApiResponse } from 'next'
import passport from 'passport'
import { createRouter } from 'next-connect'
import Google, {
  type IOAuth2StrategyOption,
  type Profile,
  type VerifyFunction
} from 'passport-google-oauth'

import userAccountService from '@/lib/service/UserAccountService'

passport.use(
  new Google.OAuth2Strategy(
    {
      clientID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NEXT_PUBLIC_GOOGLE_CALLBACK_URL
    } as IOAuth2StrategyOption,
    (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyFunction
    ) => {
      done(null, profile)
    }
  )
)

const router = createRouter<NextApiRequest, NextApiResponse>()

router.get((req, res, next) => {
  if (req.query.operation === 'auth') {
    return passport.authenticate('google', { scope: ['profile', 'email'] })(
      req,
      res,
      next
    )
  } else if (req.query.operation === 'callback') {
    return passport.authenticate(
      'google',
      async (err: any, profile: any, info: any) => {
        if (err) {
          res.status(500).end()
          return
        }

        console.log(profile)
        const userEmail = profile.emails[0].value;
        const googleUser = await userAccountService.registerUserByGoogle({
          email: userEmail,
          name: "test",
          avatar: "test"
        })
        res.json(googleUser)
        // res.setHeader('Set-Cookie', cookie)
        // res.redirect('/')
      }
    )(req, res, next)
  } else {
    res.status(400).json({ error: 'Unknown operation.' })
  }
})

export default router.handler({
  onError: (err: any, req: any, res: any) => {
    console.error(err.stack)
    res.status(err.statusCode || 500).end(err.message)
  }
})
