/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  basePath: '/PersonalWorkCollection',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig