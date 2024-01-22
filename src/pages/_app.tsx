import React from 'react';
import type {AppProps} from 'next/app';
import {AppCacheProvider} from '@mui/material-nextjs/v13-pagesRouter';
import {AuthProvider} from '@/context/AuthContext';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App({
  Component,
  pageProps: {...pageProps},
}: AppProps): React.JSX.Element {
  return (
    <AuthProvider>
      <AppCacheProvider {...pageProps}>
        <Component {...pageProps} />
        <ToastContainer autoClose={3000} closeOnClick />
      </AppCacheProvider>
    </AuthProvider>
  );
}
