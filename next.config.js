/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  outputFileTracingRoot: process.cwd(),
  
  images: {
    domains: [
      "lh3.googleusercontent.com", 
      "avatars.githubusercontent.com",
      "images.unsplash.com" 
    ],
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  experimental: {
    turbo: {
      resolveAlias: {
      }
    }
  }
}

module.exports = nextConfig