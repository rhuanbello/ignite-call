import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';

import { globalStyles } from '../styles/global';

globalStyles();

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Ignite Call</title>
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
