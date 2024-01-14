import React from 'react'
import type { AppProps } from 'next/app'
import { AppCacheProvider } from '@mui/material-nextjs/v13-pagesRouter'

export default function App ({ Component, pageProps: { session, ...pageProps } }: AppProps): React.JSX.Element {
  return (
    <AppCacheProvider {...pageProps}>
      <Component {...pageProps} />
    </AppCacheProvider>
  )
}
