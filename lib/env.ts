import "server-only";

export function normalizedAllowedDomain() {
  return (process.env.ALLOWED_EMAIL_DOMAIN ?? "yas.sn").trim().toLowerCase().replace(/^@+/, "");
}

export const env = {
  get allowedEmailDomain() {
    return normalizedAllowedDomain();
  },
  get adminPassword() {
    return process.env.ADMIN_PASSWORD ?? "";
  },
  get appSecret() {
    return process.env.APP_SECRET ?? process.env.NEXTAUTH_SECRET ?? process.env.CRON_SECRET ?? "dev-local-secret-change-me";
  },
  get cronSecret() {
    return process.env.CRON_SECRET ?? "";
  }
};

export function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? "";
}

export function isAllowedYasEmail(email?: string | null) {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  const domain = normalizedAllowedDomain();
  return normalized.endsWith(`@${domain}`) && normalized.length > domain.length + 1;
}
