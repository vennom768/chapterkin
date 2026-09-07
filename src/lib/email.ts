import { getAppUrl } from "@/lib/app-url";

type TransactionalEmail = {
  to: string;
  subject: string;
  heading: string;
  body: string;
  actionUrl: string;
  actionLabel: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderEmail({ heading, body, actionUrl, actionLabel }: TransactionalEmail) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:32px;background:#f7f0e4;font-family:Georgia,serif;color:#2c1810;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fffaf2;border:1px solid #e6d4b8;border-radius:24px;">
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.08em;color:#c45c26;">ChapterKin</p>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#2a3a5c;">${escapeHtml(heading)}</h1>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#8a6d5b;">${escapeHtml(body)}</p>
          <p style="margin:0 0 24px;">
            <a href="${escapeHtml(actionUrl)}" style="display:inline-block;background:#c45c26;color:#fff;text-decoration:none;border-radius:999px;padding:12px 22px;font-family:system-ui,sans-serif;font-size:14px;font-weight:700;">
              ${escapeHtml(actionLabel)}
            </a>
          </p>
          <p style="margin:0;font-size:13px;line-height:1.5;color:#8a6d5b;font-family:system-ui,sans-serif;">
            If the button does not work, copy this link:<br />
            <span style="word-break:break-all;">${escapeHtml(actionUrl)}</span>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendWithResend(email: TransactionalEmail, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? "ChapterKin <onboarding@resend.dev>",
      to: email.to,
      subject: email.subject,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Could not send email (${response.status}): ${detail}`);
  }
}

async function sendWithSmtp(email: TransactionalEmail, html: string) {
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.RESEND_FROM ?? "ChapterKin <noreply@localhost>",
    to: email.to,
    subject: email.subject,
    html,
    text: `${email.heading}\n\n${email.body}\n\n${email.actionLabel}: ${email.actionUrl}`,
  });
}

export async function sendTransactionalEmail(email: TransactionalEmail) {
  const html = renderEmail(email);

  if (process.env.RESEND_API_KEY) {
    await sendWithResend(email, html);
    return;
  }

  if (process.env.SMTP_HOST) {
    await sendWithSmtp(email, html);
    return;
  }

  console.info(
    `[chapterkin email] ${email.subject} → ${email.to}\n${email.actionUrl}`,
  );
}

export async function sendVerificationLink(to: string, url: string) {
  await sendTransactionalEmail({
    to,
    subject: "Confirm your ChapterKin email",
    heading: "Confirm this is you",
    body: "Tap the button to verify your parent account. This keeps family stories private.",
    actionUrl: url,
    actionLabel: "Verify email",
  });
}

export async function sendPasswordResetLink(to: string, url: string) {
  await sendTransactionalEmail({
    to,
    subject: "Reset your ChapterKin password",
    heading: "Reset your password",
    body: "Someone asked to reset the password for this parent account. If that was you, choose a new password. The link expires in an hour.",
    actionUrl: url,
    actionLabel: "Choose a new password",
  });
}

export async function sendExistingAccountNotice(to: string) {
  await sendTransactionalEmail({
    to,
    subject: "Someone tried to create a ChapterKin account with your email",
    heading: "You already have an account",
    body: "If this was you, sign in or reset your password. If it was not you, you can ignore this email. We did not create a second account.",
    actionUrl: `${getAppUrl()}/sign-in`,
    actionLabel: "Sign in",
  });
}
