export type AccessRole = "founder" | "seller";

export const FOUNDER_EMAIL = "your email here";

export function isFounderEmail(email?: string | null) {
  return email?.trim().toLowerCase() === FOUNDER_EMAIL.toLowerCase();
}

export function getAccessRole(email?: string | null): AccessRole {
  return isFounderEmail(email) ? "founder" : "seller";
}
