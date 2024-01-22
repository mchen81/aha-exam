/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {key: 'Access-Control-Allow-Credentials', value: 'true'},
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://aha-exam-fkp6jrgi4q-de.a.run.app',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,POST,PUT,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Length,Content-Type',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
