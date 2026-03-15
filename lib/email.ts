import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const BRAND = {
  name: "Instructis",
  primary: "#1a7f37",
  primaryLight: "#e8f5ec",
  text: "#22262b",
  textMuted: "#64748b",
};

interface SendEmailValues {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailValues) {
  await resend.emails.send({
    from: "portfolio@updates.bydm.site",
    to,
    subject,
    html,
  });
}

function magicLinkEmailTemplate(options: {
  title: string;
  greeting?: string;
  body: string;
  buttonLabel: string;
  url: string;
  footer?: string;
}) {
  const { title, greeting, body, buttonLabel, url, footer } = options;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND.primary} 0%, #145a2e 100%); padding: 28px 32px; text-align: center;">
              <span style="font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">${BRAND.name}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 8px; font-size: 20px; font-weight: 600; color: ${BRAND.text}; line-height: 1.3;">${title}</h1>
              ${greeting ? `<p style="margin: 0 0 16px; font-size: 15px; color: ${BRAND.textMuted}; line-height: 1.5;">${greeting}</p>` : ""}
              <p style="margin: 0 0 24px; font-size: 15px; color: ${BRAND.text}; line-height: 1.6;">${body}</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background-color: ${BRAND.primary};">
                    <a href="${url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 28px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none;">${buttonLabel}</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0; font-size: 13px; font-weight: 600; color: #dc2626; line-height: 1.5;">Do not click the button above if you did not request this or don't know what it is.</p>
              <p style="margin: 24px 0 0; font-size: 13px; color: ${BRAND.textMuted}; line-height: 1.5;">If you didn't request this, you can safely ignore this email.</p>
              ${footer ? `<p style="margin: 16px 0 0; font-size: 12px; color: ${BRAND.textMuted}; line-height: 1.5;">${footer}</p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: ${BRAND.primaryLight}; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: ${BRAND.textMuted}; text-align: center;">&copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getPasswordResetEmailHtml(userName: string | null, url: string) {
  return magicLinkEmailTemplate({
    title: "Reset your password",
    greeting: userName ? `Hi ${userName},` : undefined,
    body: "You requested a password reset. Click the button below to choose a new password. This link will expire in 1 hour.",
    buttonLabel: "Reset password",
    url,
    footer: "This link is valid for a limited time and can only be used once.",
  });
}

export function getVerificationEmailHtml(userName: string | null, url: string) {
  return magicLinkEmailTemplate({
    title: "Verify your email",
    greeting: userName ? `Hi ${userName},` : undefined,
    body: "Please verify your email address by clicking the button below. This helps us keep your account secure.",
    buttonLabel: "Verify email",
    url,
    footer: "This link is valid for a limited time.",
  });
}

export function getChangeEmailVerificationHtml(
  userName: string | null,
  newEmail: string,
  url: string
) {
  return magicLinkEmailTemplate({
    title: "Confirm your new email",
    greeting: userName ? `Hi ${userName},` : undefined,
    body: `You requested to change your email to ${newEmail}. Click the button below to confirm this change.`,
    buttonLabel: "Confirm email change",
    url,
    footer: "If you didn't request this change, you can safely ignore this email.",
  });
}
