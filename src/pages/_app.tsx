import { AppProps } from "next/app";
import Layout from "../components/Layout";
import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
import Head from "next/head";
import "../styles/globals.css";
import { SpeedInsights } from '@vercel/speed-insights/next';

// Force dark mode globally
const theme = extendTheme({
  config: {
    initialColorMode: "dark", // Set default theme to dark
    useSystemColorMode: false, // Ignore system settings
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  const pageTitle = (Component as any).title || "Hull Tattoo Studio";

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Layout title={pageTitle}>
      
        <Component {...pageProps} />
        <SpeedInsights />
      </Layout>
    </ChakraProvider>
  );
}

export default MyApp;
