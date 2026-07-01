import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Initialize SES Client only if credentials are provided.
// This prevents errors in environments where AWS credentials are not set yet (e.g. local dev fallback).
let sesClient: SESClient | null = null;

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION || "ap-south-1";

if (accessKeyId && secretAccessKey) {
  sesClient = new SESClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Sends a transactional email using AWS SES.
 * Returns true if successful, false otherwise.
 */
export async function sendEmail({ to, subject, html, from }: SendEmailParams): Promise<boolean> {
  const formatFromAddress = (addr?: string): string => {
    const raw = addr || process.env.EMAIL_FROM_ADDRESS || "reveal@blindside.in";
    if (raw.includes("<") && raw.includes(">")) {
      return raw;
    }
    return `BlindSide <${raw.trim()}>`;
  };

  const fromAddress = formatFromAddress(from);

  if (!sesClient) {
    console.warn("AWS SES is not configured. Missing AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY.");
    return false;
  }

  try {
    const command = new SendEmailCommand({
      Source: fromAddress,
      Destination: {
        ToAddresses: [to.trim().toLowerCase()],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: html,
            Charset: "UTF-8",
          },
        },
      },
    });

    const response = await sesClient.send(command);
    return !!response.MessageId;
  } catch (error) {
    console.error("AWS SES sendEmail error for recipient:", to, error);
    return false;
  }
}

/**
 * Checks if AWS SES client is configured and ready to send.
 */
export function isSESConfigured(): boolean {
  return !!sesClient;
}
