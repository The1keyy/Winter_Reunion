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

function credentialsMessage({
  displayName,
  email,
  password,
}: LoginDetailsPayload) {
  const loginUrl = `${siteUrl()}/login`;
  return [
    `Winter Reunion 2027 — save your login`,
    ``,
    `Name: ${displayName}`,
    `Email (sign-in): ${email}`,
    `Password: ${password}`,
    ``,
    `Sign in anytime: ${loginUrl}`,
    ``,
    `If you forget it later, ask Key to reset your password.`,
  ].join("\n");
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
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return {
      ok: false,
      reason: "Email not configured yet (RESEND_API_KEY / RESEND_FROM_EMAIL).",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [payload.email],
        subject: "Your Winter Reunion 2027 login",
        text: credentialsMessage(payload),
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("sendEmail (Resend) failed", response.status, body);
      return { ok: false, reason: "Email provider rejected the send." };
    }

    return { ok: true };
  } catch (error) {
    console.error("sendEmail failed", error);
    return { ok: false, reason: "Could not reach the email provider." };
  }
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

  // Keep SMS short — carriers truncate long bodies.
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
 * Missing providers are skipped so join still succeeds during setup.
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
