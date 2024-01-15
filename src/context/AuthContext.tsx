import React, { createContext, useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

import { type UserAccountDataType } from '@/types/user'
import _ from 'lodash'

const LOCAL_KEY_USER_DATA = 'user'

const apiPath = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  logout: '/api/auth/logout',
  googleAuth: '/api/auth/google/auth',
  me: '/api/user'
}

const pageUrl = {
  verify: '/user/verify',
  waitVerify: '/user/wait-verify',
  login: '/user/login'

}

interface LoginParams {
  email: string
  password: string
}

interface RegisterParams {
  email: string
  password: string
}

interface AuthValuesType {
  user: null | UserAccountDataType
  loading: boolean
  setUser: (user: UserAccountDataType) => void
  setLoading: (loading: boolean) => void
  isInitialized: boolean
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => Promise<void>
  logout: () => Promise<void>
  setIsInitialized: (isInitialized: boolean) => void
  register: (params: RegisterParams, errorCallback?: ErrCallbackType) => Promise<void>
  googleAuth: () => Promise<void>
}

const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  isInitialized: false,
  login: async () => { await Promise.resolve() },
  logout: async () => { await Promise.resolve() },
  setIsInitialized: () => Boolean,
  register: async () => { await Promise.resolve() },
  googleAuth: async () => { await Promise.resolve() }
}

const AuthContext = createContext(defaultProvider)

interface Props {
  children: ReactNode
}

type ErrCallbackType = (err: Error) => void

const AuthProvider = ({ children }: Props): React.JSX.Element => {
  // ** States
  const [user, setUser] = useState<UserAccountDataType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)
  const [isInitialized, setIsInitialized] = useState<boolean>(defaultProvider.isInitialized)

  // ** Hooks
  const router = useRouter()

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      setIsInitialized(true)
      setLoading(true)
      await axios
        .get(apiPath.me)
        .then(async response => {
          const user: UserAccountDataType = response.data
          setUser(user)
          if (!user.isVerified) {
            void router.push(pageUrl.waitVerify)
          }
        })
        .catch(() => {
          localStorage.removeItem(LOCAL_KEY_USER_DATA)
          setUser(null)
        }).finally(() => { setLoading(false) })
    }

    initAuth()
  }, [])

  const handleLogin = async (params: LoginParams, errorCallback?: ErrCallbackType): Promise<void> => {
    await axios.post(apiPath.login, params)
      .then(() => {
        void axios.get(apiPath.me)
          .then(async response => {
            const returnUrl = router.query.returnUrl
            const data: UserAccountDataType = response.data
            setUser(data)
            const dataJson = JSON.stringify(data)
            window.localStorage.setItem(LOCAL_KEY_USER_DATA, dataJson)

            let redirectURL = !_.isEmpty(returnUrl) ? returnUrl : '/'
            if (!data.isVerified) {
              redirectURL = pageUrl.waitVerify
            }

            await router.replace(redirectURL as string)
          })
      })
      .catch(err => {
        if (errorCallback !== undefined) {
          errorCallback(err as Error)
        }
      })
  }

  const handleLogout = async (): Promise<void> => {
    setUser(null)
    setIsInitialized(false)
    await axios.post(apiPath.logout)
    window.localStorage.removeItem(LOCAL_KEY_USER_DATA)
    void router.push(pageUrl.login)
  }

  const handleRegister = async (params: RegisterParams, errorCallback?: ErrCallbackType): Promise<void> => {
    await axios
      .post(apiPath.register, params)
      .then(res => {
        if (!_.isEmpty(res.data?.error)) {
          if (errorCallback !== undefined) {
            errorCallback(new Error(res.data.error))
          }
        } else {
          void router.push(pageUrl.verify)
        }
      })
      .catch((err: Record<string, string>) => ((errorCallback !== undefined) ? errorCallback(err) : null))
  }

  const handleGoogleAuth = async (errorCallback?: ErrCallbackType): Promise<void> => {
    await axios
      .get(apiPath.googleAuth)
      .then(res => {
        if (res.data?.error) {
          if (errorCallback !== undefined) {
            errorCallback(res.data.error)
          }
        }
      })
      .catch((err: Record<string, string>) => ((errorCallback !== undefined) ? errorCallback(err) : null))
  }

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
    googleAuth: handleGoogleAuth
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }