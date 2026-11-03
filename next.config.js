const isDev = process.env.NODE_ENV === 'development';

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: isDev,
});

module.exports = withPWA({
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    if (isDev) return [];
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            // Each directive is listed separately for readability and easy maintenance.
            value: [
              "default-src 'self'",
              // Scripts: Next.js internals + Google Maps JS API
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com",
              // Styles: inline (Tailwind/Next), Google Fonts, unpkg (Leaflet CSS CDN)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
              // Images: self, data URIs, blob (canvas), ALL https for OSM/ArcGIS/GitHub/Unsplash tiles
              "img-src 'self' data: blob: https: http:",
              // Fonts: Google Fonts, unpkg (Leaflet font assets)
              "font-src 'self' https://fonts.gstatic.com https://unpkg.com",
              // Connections: Nominatim geocoder, OSM tile servers (a/b/c subdomains),
              //              ArcGIS satellite, GitHub (marker icons), Vercel
              "connect-src 'self' " + [
                "https://fonts.googleapis.com",
                "https://fonts.gstatic.com",
                "https://images.unsplash.com",
                "https://maps.googleapis.com",
                "https://nominatim.openstreetmap.org",
                "https://server.arcgisonline.com",
                "https://*.tile.openstreetmap.org",
                "https://unpkg.com",
                "https://raw.githubusercontent.com",
                "https://cdnjs.cloudflare.com",
              ].join(' '),
              // Service workers / PWA
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
});
