// src/pages/_app.tsx

import { AppProps } from 'next/app';
import Layout from '../components/Layout';
import { ChakraProvider } from '@chakra-ui/react';
import Head from 'next/head';
import '../styles/globals.css'; // Ensure you have global styles

function MyApp({ Component, pageProps }: AppProps) {
  // If the page component has a 'title' property, use it. Otherwise, default.
  const pageTitle = (Component as any).title || 'Hull Tattoo Studio';

  return (
    <ChakraProvider>
      <Layout title={pageTitle}>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  );
}

export default MyApp;
