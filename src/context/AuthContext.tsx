import React, {createContext, useEffect, useState, type ReactNode} from 'react';
import {useRouter} from 'next/router';
import axios from 'axios';

import {type UserAccountDataType} from '@/types/user';
import _ from 'lodash';
import {LOCAL_STORAGE_KEY} from '@/util/constants';

const apiPath = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  logout: '/api/auth/logout',
  googleAuth: '/api/auth/google/auth',
  me: '/api/user/me',
};

const pageUrl = {
  home: '/',
  waitVerify: '/user/wait-verify',
  login: '/user/login',
};

interface LoginParams {
  email: string;
  password: string;
}

interface RegisterParams {
  email: string;
  password: string;
}

export interface AuthValuesType {
  user: null | UserAccountDataType;
  loading: boolean;
  setUser: (user: UserAccountDataType) => void;
  setLoading: (loading: boolean) => void;
  isInitialized: boolean;
  login: (
    params: LoginParams,
    errorCallback?: ErrCallbackType
  ) => Promise<void>;
  logout: (suppressFallback?: boolean) => Promise<void>;
  setIsInitialized: (isInitialized: boolean) => void;
  register: (
    params: RegisterParams,
    errorCallback?: ErrCallbackType
  ) => Promise<void>;
  reloadUser: () => Promise<void>;
}

const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  isInitialized: false,
  login: async () => {
    await Promise.resolve();
  },
  logout: async () => {
    await Promise.resolve();
  },
  setIsInitialized: () => Boolean,
  register: async () => {
    await Promise.resolve();
  },
  reloadUser: async () => {
    await Promise.resolve();
  },
};

const AuthContext = createContext(defaultProvider);

interface Props {
  children: ReactNode;
}

type ErrCallbackType = (err: Error) => void;

const AuthProvider = ({children}: Props): React.JSX.Element => {
  const [user, setUser] = useState<UserAccountDataType | null>(
    defaultProvider.user
  );
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading);
  const [isInitialized, setIsInitialized] = useState<boolean>(
    defaultProvider.isInitialized
  );

  const router = useRouter();

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      setIsInitialized(true);
      setLoading(true);
      await axios
        .get(apiPath.me)
        .then(async response => {
          const user: UserAccountDataType = response.data;
          setUser(user);
          if (!user.isVerified) {
            void router.push(pageUrl.waitVerify);
          }
        })
        .catch(() => {
          localStorage.removeItem(LOCAL_STORAGE_KEY.user);
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    initAuth();
  }, []);

  const handleLogin = async (
    params: LoginParams,
    errorCallback?: ErrCallbackType
  ): Promise<void> => {
    await axios
      .post(apiPath.login, params)
      .then(() => {
        void axios.get(apiPath.me).then(async response => {
          const returnUrl = router.query.returnUrl;
          const data: UserAccountDataType = response.data;
          setUser(data);
          const dataJson = JSON.stringify(data);
          window.localStorage.setItem(LOCAL_STORAGE_KEY.user, dataJson);

          let redirectURL = !_.isEmpty(returnUrl) ? returnUrl : '/';
          if (!data.isVerified) {
            redirectURL = pageUrl.waitVerify;
          }

          await router.replace(redirectURL as string);
        });
      })
      .catch((err: Error) => {
        if (errorCallback !== undefined) {
          errorCallback(new Error(err.message));
        }
      });
  };

  const handleLogout = async (suppressFallback?: boolean): Promise<void> => {
    setUser(null);
    setIsInitialized(false);
    await axios.post(apiPath.logout);
    window.localStorage.removeItem(LOCAL_STORAGE_KEY.user);
    if (!suppressFallback) {
      router.push(pageUrl.home);
    }
  };

  const handleRegister = async (
    params: RegisterParams,
    errorCallback?: ErrCallbackType
  ): Promise<void> => {
    await axios
      .post(apiPath.register, params)
      .then(res => {
        if (!_.isEmpty(res.data?.error)) {
          if (errorCallback !== undefined) {
            errorCallback(new Error(res.data.error));
          }
        } else {
          router.push(pageUrl.waitVerify);
        }
      })
      .catch((err: Error) => {
        if (errorCallback !== undefined) {
          errorCallback(new Error(err.message));
        }
      });
  };

  const handleReloadUser = async (): Promise<void> => {
    await axios
      .get(apiPath.me)
      .then(async response => {
        const user: UserAccountDataType = response.data;
        setUser(user);
        if (!user.isVerified) {
          void router.push(pageUrl.waitVerify);
        }
      })
      .catch(() => {
        localStorage.removeItem(LOCAL_STORAGE_KEY.user);
        setUser(null);
        void router.push(pageUrl.home);
      });
  };

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    isInitialized,
    setIsInitialized,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    reloadUser: handleReloadUser,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export {AuthContext, AuthProvider};
