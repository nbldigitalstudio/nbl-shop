export type AccessRole = "founder" | "seller";

function founderEmails() {
  return (process.env.FOUNDER_EMAILS ?? process.env.FOUNDER_EMAIL ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isFounderEmail(email?: string | null) {
  return !!email && founderEmails().includes(email.trim().toLowerCase());
}

export function getAccessRole(email?: string | null): AccessRole {
  return isFounderEmail(email) ? "founder" : "seller";
}
