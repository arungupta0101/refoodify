import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = window.localStorage.getItem('theme');
                  var systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = storedTheme === 'light' || storedTheme === 'dark'
                    ? storedTheme
                    : (systemPrefersDark ? 'dark' : 'light');
                  var root = document.documentElement;
                  root.classList.toggle('dark', theme === 'dark');
                  root.style.colorScheme = theme;
                } catch (error) {}
              })();
            `,
          }}
        />
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
