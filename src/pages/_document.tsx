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

        {/* Deferred Calendly CSS to avoid render blocking */}
        <link
          rel="stylesheet"
          href="https://assets.calendly.com/assets/external/widget.css"
          media="print"
          onLoad={(e) => {
            // Convert the event to a typed React event
            const link = e.currentTarget;
            link.removeAttribute("media");
            // link.onload = null; // optional if you really want to clear the handler
          }}
        />

        {/* Defer third-party script with Next's <Script> component */}
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="lazyOnload"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
