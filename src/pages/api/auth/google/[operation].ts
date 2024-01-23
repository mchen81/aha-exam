import type {NextApiRequest, NextApiResponse} from 'next';
import passport from 'passport';
import {createRouter} from 'next-connect';
import Google, {
  type IOAuth2StrategyOption,
  type Profile,
  type VerifyFunction,
  Profile as GoogleProfile,
} from 'passport-google-oauth';

import UserAuthService from '@/lib/service/UserAuthService';

import _ from 'lodash';

import {setCookieForSession} from '@/util/http';
import ApplicationError from '@/lib/service/ApplicationError';
import config from '@/util/config';

const userAuthService = UserAuthService.getInstance();

const googleOAuth2Options: IOAuth2StrategyOption = {
  clientID: config.oauthGoogleClientId,
  clientSecret: config.oauthGoogleClientSecret,
  callbackURL: config.oauthGoogleCallbackUrl,
};

passport.use(
  new Google.OAuth2Strategy(
    googleOAuth2Options,
    (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyFunction
    ) => {
      done(null, profile);
    }
  )
);

/**
 * @swagger
 * /api/auth/google/auth:
 *   get:
 *     tags:
 *       - auth
 *     summary: Direct user to the google authentication page
 *     description: Note You should not invoke this endpoint directly through swagger
 *     responses:
 *       302:
 *         description: User logged out successfully
 * /api/auth/google/callback:
 *   get:
 *     tags:
 *       - auth
 *     summary: After google authentication, google side will invokes this endpoint
 *     description: Note You should not invoke this endpoint directly through swagger
 *     responses:
 *       302:
 *         description: Redirect to dashboard
 */
const router = createRouter<NextApiRequest, NextApiResponse>();

router.get((req, res, next) => {
  if (req.query.operation === 'auth') {
    return passport.authenticate('google', {scope: ['profile', 'email']})(
      req,
      res,
      next
    );
  } else if (req.query.operation === 'callback') {
    return passport.authenticate(
      'google',
      async (err: unknown, profile: GoogleProfile) => {
        if (!_.isEmpty(err)) {
          res.redirect('/error?message=Failed to authenticate');
          return;
        }
        try {
          const userEmail =
            profile.emails !== undefined ? profile.emails[0].value : null;

          if (userEmail === null) {
            throw new ApplicationError(400, 'Google oauth callback error');
          }

          const username = profile.displayName;

          const avatar =
            profile.photos !== undefined ? profile.photos[0].value : undefined;
          const loginResult = await userAuthService.registerOrLoginUserByGoogle(
            {
              email: userEmail,
              name: username,
              avatar,
            }
          );

          setCookieForSession(res, loginResult.sessionToken);
          res.redirect('/app/dashboard');
        } catch (err) {
          if (err instanceof ApplicationError) {
            res.redirect(`/error?message=${err.message}`);
          } else {
            console.log(err);
            res.redirect(
              '/error?message=Internal Server Error, please try again later'
            );
          }
        }
      }
    )(req, res, next);
  } else {
    res.status(400).json({error: 'Unknown operation.'});
  }
});

export default router.handler();
