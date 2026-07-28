import { Resend } from 'resend';

let resendClient: Resend | null = null;
const resendApiKey = process.env.RESEND_API_KEY;

if (resendApiKey) {
  resendClient = new Resend(resendApiKey);
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Sends a transactional email using Resend.
 * Returns true if successful, false otherwise.
 */
export async function sendEmail({ to, subject, html, from }: SendEmailParams): Promise<boolean> {
  const formatFromAddress = (addr?: string): string => {
    const raw = addr || process.env.EMAIL_OTP_FROM_ADDRESS || "verify@blindside.in";
    if (raw.includes("<") && raw.includes(">")) {
      return raw;
    }
    return `BlindSide <${raw.trim()}>`;
  };

  const fromAddress = formatFromAddress(from);

  if (!resendClient) {
    console.warn("Resend is not configured. Missing RESEND_API_KEY.");
    return false;
  }

  try {
    const { data, error } = await resendClient.emails.send({
      from: fromAddress,
      to: [to.trim().toLowerCase()],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Resend sendEmail error for recipient:", to, error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Resend sendEmail exception for recipient:", to, error);
    return false;
  }
}

/**
 * Checks if Resend client is configured and ready to send.
 */
export function isResendConfigured(): boolean {
  return !!resendClient;
}
