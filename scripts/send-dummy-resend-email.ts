import { Resend } from "resend";

// Hardcoded values as requested.
const RESEND_API_KEY = '';
const FROM_EMAIL = "no-reply@instructis.in";
const TO_EMAIL = "dheerajmanwani2000@gmail.com";
const SUBJECT = "Dummy Email from Instructis";

const HTML = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
  <h2 style="margin: 0 0 12px;">Hello from Instructis 👋</h2>
  <p style="margin: 0 0 10px;">This is a hardcoded dummy email sent using Resend.</p>
  <p style="margin: 0 0 10px;">If you received this, the test script is working.</p>
  <p style="margin: 0; color: #6b7280; font-size: 13px;">Timestamp: ${new Date().toISOString()}</p>
</div>
`;

async function main() {
  const resend = new Resend(RESEND_API_KEY);

  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject: SUBJECT,
    html: HTML,
  });

  console.log("Email send response:", result);
}

main().catch((error) => {
  console.error("Failed to send dummy email:", error);
  process.exit(1);
});
