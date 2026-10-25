import { SHORT_BRAND } from "@/lib/brand";
import {
  buildBrandedEmailShell,
  type BrandedEmailContent,
} from "@/lib/notifications/templates/email-shell";

export function buildInviteEmail(input: {
  actionUrl: string;
  logoUrl: string;
  appUrl: string;
  recipientName?: string | null;
  alreadyHadAccount?: boolean;
}): BrandedEmailContent {
  const greeting = input.recipientName?.trim()
    ? `Hi ${input.recipientName.trim()},`
    : "Hello,";
  const title = input.alreadyHadAccount
    ? "You’re on the IP SHAP team"
    : "Welcome to the IP SHAP team";
  const intro = input.alreadyHadAccount
    ? `${greeting} an owner added you to the admin team. Choose a password with the button below, then sign in.`
    : `${greeting} you’ve been invited to the IP SHAP admin. Set your password with the button below to get started.`;

  return buildBrandedEmailShell({
    subject: `${SHORT_BRAND} · You’re invited to the admin team`,
    preheader: "Set your password to access the IP SHAP admin.",
    eyebrow: "Team invite",
    title,
    intro,
    ctaLabel: "Set your password",
    ctaUrl: input.actionUrl,
    footerNote: "This invite is for IP SHAP staff only.",
    logoUrl: input.logoUrl,
    appUrl: input.appUrl,
    textLines: [
      `${SHORT_BRAND} — team invite`,
      "",
      intro,
      "",
      `Set your password: ${input.actionUrl}`,
      "",
      "If you were not expecting this, you can ignore this email.",
      "",
      "—",
      SHORT_BRAND,
      input.appUrl,
    ],
  });
}

export function buildPasswordResetEmail(input: {
  actionUrl: string;
  logoUrl: string;
  appUrl: string;
}): BrandedEmailContent {
  const intro =
    "We received a request to reset your IP SHAP admin password. Use the button below to choose a new one. If you did not ask for this, you can ignore this email.";

  return buildBrandedEmailShell({
    subject: `${SHORT_BRAND} · Reset your password`,
    preheader: "Choose a new password for your admin account.",
    eyebrow: "Password reset",
    title: "Reset your password",
    intro,
    ctaLabel: "Reset password",
    ctaUrl: input.actionUrl,
    footerNote: "Password reset for your IP SHAP admin account.",
    logoUrl: input.logoUrl,
    appUrl: input.appUrl,
    textLines: [
      `${SHORT_BRAND} — password reset`,
      "",
      intro,
      "",
      `Reset password: ${input.actionUrl}`,
      "",
      "—",
      SHORT_BRAND,
      input.appUrl,
    ],
  });
}
