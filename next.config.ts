import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [
      'puppeteer-extra', 
      'puppeteer-extra-plugin-stealth',
      'puppeteer-extra-plugin-recaptcha',
  ],
  output: 'standalone',
  webpackDevMiddleware: (config: any) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300
    };
    return config;
  }
};

export default nextConfig;
