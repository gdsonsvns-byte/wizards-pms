/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export - site now fetches live data from MySQL
  images: { unoptimized: true }
}
module.exports = nextConfig
