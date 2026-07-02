import type { NextConfig } from "next";

// 위젯 스크립트는 Mother App(다른 origin)이 <script type="module">로 로드하므로
// CORS 허용이 필요하다. (module script는 CORS 모드로 fetch된다)
const nextConfig: NextConfig = {
  async headers() {
    // 위젯이 Mother App(:3000) 안에서 실행되면서 이 앱의 자기 API(:3004)를
    // 직접 호출하므로 스크립트/데이터 둘 다 CORS 허용이 필요하다.
    const cors = [
      { key: "Access-Control-Allow-Origin", value: "http://localhost:3000" },
    ];
    return [
      { source: "/widgets/:path*", headers: cors },
      { source: "/api/:path*", headers: cors },
    ];
  },
};

export default nextConfig;
