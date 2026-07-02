import type { NextConfig } from "next";

// 위젯 스크립트는 Mother App(다른 origin)이 <script type="module">로 로드하므로
// CORS 허용이 필요하다. (module script는 CORS 모드로 fetch된다)
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/widgets/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "http://localhost:3000" },
        ],
      },
    ];
  },
};

export default nextConfig;
