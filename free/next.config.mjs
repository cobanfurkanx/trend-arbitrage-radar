const basePath = process.env.RADAR_BASE_PATH ?? "";
if (basePath && (!basePath.startsWith("/") || basePath.endsWith("/"))) throw new Error("RADAR_BASE_PATH must look like /trends");
export default {
  output: "export",
  trailingSlash: true,
  basePath,
  env: { NEXT_PUBLIC_RADAR_BASE_PATH: basePath },
  images: { unoptimized: true },
  reactStrictMode: true,
};
