/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: '2mb' } }, // photos and video upload directly from the browser
};
export default nextConfig;
