import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/refoodify.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#22c55e" />
        <link rel="apple-touch-icon" href="/refoodify.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="google-site-verification"
          content="eruoAVfU-z3MKWx_cd_WCIUtsOxMJMWWHMIO2PU0Uck"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
