/** @type {import('next').NextConfig} */

import cloudinary from 'cloudinary';
import { config as envConfig } from 'dotenv';

// Load environment variables from .env file
envConfig();

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'do5l7hms7',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const nextConfig = {};

export default nextConfig;
