// src/pages/_app.tsx

import { AppProps } from "next/app";
import Layout from "../components/Layout";
import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
import "../styles/globals.css";
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script'; // Import Script from next/script

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
      {/* Color mode script must be before any other script */}
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />

      {/* Google AdSense Script */}
      <Script
        strategy="afterInteractive" // Load the script after the page becomes interactive
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6959045179650835"
        crossOrigin="anonymous"
      />

      <Layout title={pageTitle}>
        <Component {...pageProps} />
        <SpeedInsights />
        <Analytics />
      </Layout>
    </ChakraProvider>
  );
}

export default MyApp;
