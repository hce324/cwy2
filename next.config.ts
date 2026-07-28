import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ali-oss 依赖 urllib，其 detect_proxy_agent 内有 require('proxy-agent') 懒加载，
  // Turbopack 构建期会静态解析并报 module not found。标记为外部包后整条依赖树走运行时
  // Node 原生 require，绕过打包器解析（proxy-agent 等可选依赖无需安装）。
  serverExternalPackages: ["ali-oss"],
};

export default nextConfig;
