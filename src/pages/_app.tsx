import { AppProps } from 'next/app';
import { useEffect } from 'react';
import Layout from '../components/Layout';
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react';
import '../styles/globals.css';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';


// Force dark mode globally
const theme = extendTheme({
  config: {
    initialColorMode: 'dark', // Set default theme to dark
    useSystemColorMode: false, // Ignore system settings
  },
});

function MyApp({ Component, pageProps }: AppProps) {
 

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Layout>
      <SpeedInsights />
      <Analytics />
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  );
}

export default MyApp;
