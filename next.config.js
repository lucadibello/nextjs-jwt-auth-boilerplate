/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Allow images from unsplash.com
  images: {
    domains: ['images.unsplash.com'],
  },
}

module.exports = nextConfig
