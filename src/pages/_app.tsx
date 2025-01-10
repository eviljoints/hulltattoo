import { AppProps } from 'next/app';
import { useEffect } from 'react';
import Layout from '../components/Layout';
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react';
import '../styles/globals.css';

// Force dark mode globally
const theme = extendTheme({
  config: {
    initialColorMode: 'dark', // Set default theme to dark
    useSystemColorMode: false, // Ignore system settings
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const adScript = document.createElement('script');
    adScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6959045179650835';
    adScript.async = true;
    adScript.crossOrigin = 'anonymous';
    document.head.appendChild(adScript);
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  );
}

export default MyApp;
