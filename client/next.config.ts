const nextConfig = {
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
  async rewrites() {
    const apiUrl = 'http://localhost:3001/api';
    const uploadsUrl = 'http://localhost:3001/uploads';
    const apiDocker = 'http://server:3001/api';
    const uploadsDocker = 'http://server:3001/uploads';

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${uploadsUrl}/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${apiDocker}/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${uploadsDocker}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'server',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'server',
        port: '4000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
