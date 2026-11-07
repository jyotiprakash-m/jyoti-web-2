import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // Visiting the home URL sends people to the desk page.
        // permanent: false → a temporary (307) redirect, so browsers and search engines don't cache it
        // and "/" can be pointed somewhere else later.
        source: "/",
        destination: "/development",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
