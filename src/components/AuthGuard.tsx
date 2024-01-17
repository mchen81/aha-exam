/**
 * @fileoverview A component that prevent un-loggin users from accessing auth required resources
 */

import React, {type ReactNode, type ReactElement, useEffect} from 'react';
import {useRouter} from 'next/router';
import {useAuth} from '@/hooks/useAuth';
import {LOCAL_STORAGE_KEY} from '@/util/constants';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactElement | null;
}

const AuthGuard = (props: AuthGuardProps): ReactElement => {
  const {children, fallback} = props;
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (
      auth.user === null &&
      !window.localStorage.getItem(LOCAL_STORAGE_KEY.user)
    ) {
      if (router.asPath !== '/') {
        void router.replace({
          pathname: '/user/login',
          query: {returnUrl: router.asPath},
        });
      } else {
        void router.replace('/user/login');
      }
    } else if (auth.user !== null && !auth.user.isVerified) {
      void router.replace('/user/wait-verify');
    }
  }, [router.route]);

  if (auth.loading || auth.user === null) {
    if (fallback) {
      return fallback;
    } else {
      return <> Loading ... </>;
    }
  }

  return <>{children}</>;
};

export default AuthGuard;
