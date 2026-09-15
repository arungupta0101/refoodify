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
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
        <meta name="theme-color" content="#22c55e" />
        <link rel="apple-touch-icon" href="/refoodify.png" />
        <meta name="mobile-web-app-capable" content="yes" />
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
