function normalizeUrl(value: string) {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/$/, "");
}

export function getAppUrl(requestOrigin?: string) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configuredUrl) return normalizeUrl(configuredUrl);

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProductionUrl) return normalizeUrl(vercelProductionUrl);

  const vercelDeploymentUrl = process.env.VERCEL_URL?.trim();
  if (vercelDeploymentUrl) return normalizeUrl(vercelDeploymentUrl);

  if (requestOrigin) return normalizeUrl(requestOrigin);
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";

  throw new Error("NEXT_PUBLIC_APP_URL is required in production.");
}
