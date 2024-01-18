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
          res.status(500).end();
          return;
        }

        const userEmail =
          profile.emails !== undefined ? profile.emails[0].value : null;

        if (userEmail === null) {
          throw new ApplicationError(400, 'Google oauth callback error');
        }

        const username = profile.displayName;

        const avatar =
          profile.photos !== undefined ? profile.photos[0].value : undefined;

        const loginResult = await userAuthService.registerOrLoginUserByGoogle({
          email: userEmail,
          name: username,
          avatar,
        });

        setCookieForSession(res, loginResult.sessionToken);
        res.status(200).end();
      }
    )(req, res, next);
  } else {
    res.status(400).json({error: 'Unknown operation.'});
  }
});

export default router.handler({
  onError: (err: unknown, req: NextApiRequest, res: NextApiResponse) => {
    if (err instanceof ApplicationError) {
      res.status(400).json({error: err.message});
    } else {
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
    }
  },
});
