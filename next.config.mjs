/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@fumadocs/local-md', 'shiki'],
};

export default config;
