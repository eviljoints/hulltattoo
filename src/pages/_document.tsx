// src/pages/_document.tsx

import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en" data-theme="dark">
      <Head>
        {/* Preload fonts to reduce LCP time */}
        <link
          rel="preload"
          href="/fonts/VanillaWhale.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />

      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
