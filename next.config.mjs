/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  { key: 'Origin-Agent-Cluster', value: '?1' },
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
      // wasm-unsafe-eval: ONNX Runtime do removedor de fundo (WebAssembly).
      // www.mercadopago.com: security.js (Device ID antifraude do Checkout Pro).
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: https://challenges.cloudflare.com https://www.mercadopago.com https://sdk.mercadopago.com https://http2.mlstatic.com https://cdn.jsdelivr.net https://esm.sh https://www.googletagmanager.com https://www.clarity.ms",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://http2.mlstatic.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com https://http2.mlstatic.com",
      // jsdelivr/esm.sh: lib do removedor; staticimgly.com: modelos ONNX/WASM.
      "connect-src 'self' blob: data: https://challenges.cloudflare.com https://www.mercadopago.com https://api.mercadopago.com https://sdk.mercadopago.com https://events.mercadopago.com https://http2.mlstatic.com https://api-static.mercadopago.com https://secure-fields.mercadopago.com https://cdn.jsdelivr.net https://esm.sh https://staticimgly.com https://*.staticimgly.com https://api.zoop.ws https://www.google-analytics.com https://region1.google-analytics.com https://*.clarity.ms",
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      "frame-src https://challenges.cloudflare.com https://www.mercadopago.com https://www.mercadolibre.com https://secure-fields.mercadopago.com https://api-static.mercadopago.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  }
];

const nextConfig = {
  reactStrictMode: true,
  // API routes + /orcamento/[id] precisam de server runtime (Prisma).
  // Otimização de imagens ativa (requer sharp no container).
  images: {
    formats: ['image/avif', 'image/webp']
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
      },
      {
        // Só X-Robots-Tag: o Cache-Control do Next (via revalidate) já cobre o sitemap.
        // Dois Cache-Control quebram o parse de alguns crawlers (erro HTTP geral no GSC).
        source: '/sitemap.xml',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }]
      },
      {
        source: '/sitemaps/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }]
      }
    ];
  }
};

export default nextConfig;
