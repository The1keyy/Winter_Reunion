import { Resend } from "resend";

export interface LoginDetailsPayload {
  displayName: string;
  email: string;
  password: string;
  phone: string;
}

export interface DeliveryResult {
  emailSent: boolean;
  smsSent: boolean;
  emailSkippedReason?: string;
  smsSkippedReason?: string;
}

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://winter-reunion.vercel.app"
  );
}

function credentialsText({
  displayName,
  email,
  password,
}: LoginDetailsPayload) {
  const loginUrl = `${siteUrl()}/login`;
  return [
    `Winter Reunion 2027 — save your login (screenshot this)`,
    ``,
    `Name: ${displayName}`,
    `Email (username): ${email}`,
    `Password: ${password}`,
    ``,
    `Sign in here: ${loginUrl}`,
    ``,
    `Ignore any confusing Confirm link — your real login is email + password above.`,
    `Locked out later? Ask Key to reset your password.`,
  ].join("\n");
}

function credentialsHtml({
  displayName,
  email,
  password,
}: LoginDetailsPayload) {
  const loginUrl = `${siteUrl()}/login`;
  return `
    <div style="font-family: Georgia, serif; color: #1a1a1a; line-height: 1.5; max-width: 480px;">
      <h1 style="font-weight: 400; font-size: 22px; margin: 0 0 12px;">Winter Reunion 2027</h1>
      <p style="margin: 0 0 16px;">Screenshot this — it's your login.</p>
      <p style="margin: 0 0 8px;"><strong>Name:</strong> ${escapeHtml(displayName)}</p>
      <p style="margin: 0 0 8px;"><strong>Email (username):</strong> ${escapeHtml(email)}</p>
      <p style="margin: 0 0 16px;"><strong>Password:</strong> ${escapeHtml(password)}</p>
      <p style="margin: 0 0 16px;">
        <a href="${loginUrl}" style="color: #1a1a1a;">Sign in here</a>
      </p>
      <p style="margin: 0; color: #666; font-size: 14px;">
        Ignore any confusing Confirm link. Locked out later? Ask Key to reset your password.
      </p>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Normalize common US numbers to E.164 for Twilio. */
export function toE164Phone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (phone.trim().startsWith("+") && digits.length >= 10) return `+${digits}`;
  return null;
}

async function sendEmail(
  payload: LoginDetailsPayload
): Promise<{ ok: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Winter Reunion <onboarding@resend.dev>";

  if (!apiKey) {
    return {
      ok: false,
      reason: "Email not configured yet (RESEND_API_KEY).",
    };
  }

  const replyTo = process.env.RESEND_REPLY_TO?.trim() || undefined;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [payload.email],
    ...(replyTo ? { replyTo } : {}),
    subject: "Your Winter Reunion 2027 login",
    text: credentialsText(payload),
    html: credentialsHtml(payload),
  });

  if (error) {
    console.error("sendEmail (Resend) failed", error);
    return {
      ok: false,
      reason: error.message || "Email provider rejected the send.",
    };
  }

  return { ok: true };
}

async function sendSms(
  payload: LoginDetailsPayload
): Promise<{ ok: boolean; reason?: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) {
    return {
      ok: false,
      reason:
        "SMS not configured yet (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER).",
    };
  }

  const to = toE164Phone(payload.phone);
  if (!to) {
    return { ok: false, reason: "Phone number could not be formatted for SMS." };
  }

  const body = [
    `Winter Reunion login`,
    `Name: ${payload.displayName}`,
    `Email: ${payload.email}`,
    `Password: ${payload.password}`,
    `Sign in: ${siteUrl()}/login`,
  ].join("\n");

  try {
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const params = new URLSearchParams({ To: to, From: from, Body: body });
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("sendSms (Twilio) failed", response.status, text);
      return { ok: false, reason: "SMS provider rejected the send." };
    }

    return { ok: true };
  } catch (error) {
    console.error("sendSms failed", error);
    return { ok: false, reason: "Could not reach the SMS provider." };
  }
}

/**
 * Sends the brand-new login once at join time (password is never stored
 * afterward). Email via Resend; SMS via Twilio when those env vars exist.
 */
export async function sendLoginDetails(
  payload: LoginDetailsPayload
): Promise<DeliveryResult> {
  const [emailResult, smsResult] = await Promise.all([
    sendEmail(payload),
    sendSms(payload),
  ]);

  return {
    emailSent: emailResult.ok,
    smsSent: smsResult.ok,
    emailSkippedReason: emailResult.ok ? undefined : emailResult.reason,
    smsSkippedReason: smsResult.ok ? undefined : smsResult.reason,
  };
}
