/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://sdk.mercadopago.com https://http2.mlstatic.com",
      "style-src 'self' 'unsafe-inline' https://http2.mlstatic.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://http2.mlstatic.com",
      "connect-src 'self' https://challenges.cloudflare.com https://api.mercadopago.com https://sdk.mercadopago.com https://events.mercadopago.com https://http2.mlstatic.com https://api-static.mercadopago.com https://secure-fields.mercadopago.com",
      "frame-src https://challenges.cloudflare.com https://www.mercadopago.com https://www.mercadolibre.com https://secure-fields.mercadopago.com https://api-static.mercadopago.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  }
];

const nextConfig = {
  reactStrictMode: true,
  // API routes + /orcamento/[id] precisam de server runtime (Supabase/Prisma).
  // Export estático impede rotas dinâmicas e route handlers.
  images: {
    unoptimized: true
  },
  webpack: (config) => {
    // pdfjs-dist referencia "canvas"/"encoding" (uso Node-only) que não existem neste app.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      encoding: false
    };
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
