/**
 * Clean, modern, responsive email template for wallet credit drops.
 * Supports both light mode and dark mode across all major email clients.
 */

interface DropEmailParams {
  firstName: string;
  amount: number;
  appUrl?: string;
}

export function generateDropEmailHtml({ firstName, amount, appUrl }: DropEmailParams): string {
  const targetUrl = appUrl || "https://blindside.in/dashboard";
  const name = firstName ? firstName.trim() : "there";
  const formattedAmount = Number(amount).toFixed(2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>You received ₹${formattedAmount} in your BlindSide Wallet!</title>
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    @media (prefers-color-scheme: dark) {
      .body-bg {
        background-color: #090a0f !important;
      }
      .card-box {
        background-color: #12141c !important;
        border: 1px solid #232738 !important;
        color: #f1f5f9 !important;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5) !important;
      }
      .title-text {
        color: #ffffff !important;
      }
      .body-text {
        color: #cbd5e1 !important;
      }
      .badge-bg {
        background-color: rgba(232, 58, 114, 0.12) !important;
        border-color: rgba(232, 58, 114, 0.3) !important;
      }
      .amount-text {
        color: #fb7185 !important;
      }
      .step-card {
        background-color: #181b27 !important;
        border: 1px solid #262b3d !important;
      }
      .step-title {
        color: #f8fafc !important;
      }
      .step-desc {
        color: #94a3b8 !important;
      }
      .divider-line {
        border-color: #232738 !important;
      }
      .footer-text {
        color: #64748b !important;
      }
    }
  </style>
</head>
<body class="body-bg" style="margin: 0; padding: 28px 12px; background-color: #f4f5f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" align="center">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" class="card-box" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05); overflow: hidden; margin: 0 auto;">
          
          <!-- Brand Header -->
          <tr>
            <td align="center" style="padding: 32px 28px 12px 28px;">
              <span style="font-size: 22px; font-weight: 900; letter-spacing: -0.03em; color: #e83a72; text-transform: uppercase;">BLINDSIDE</span>
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #94a3b8; margin-top: 4px;">Campus Dating</div>
            </td>
          </tr>

          <!-- Hero Credit Drop Banner -->
          <tr>
            <td align="center" style="padding: 12px 28px 20px 28px;">
              <table role="presentation" class="badge-bg" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, rgba(232, 58, 114, 0.08) 0%, rgba(244, 114, 182, 0.12) 100%); border-radius: 14px; border: 1px solid rgba(232, 58, 114, 0.22); padding: 22px 16px; text-align: center;">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #e83a72; background: rgba(232, 58, 114, 0.12); border-radius: 9999px; padding: 4px 12px; margin-bottom: 8px;">
                      🎁 Free Wallet Credit
                    </span>
                    <div class="amount-text" style="font-size: 38px; font-weight: 900; color: #e83a72; letter-spacing: -0.03em; margin: 4px 0; font-variant-numeric: tabular-nums;">
                      +₹${formattedAmount}
                    </div>
                    <div style="font-size: 13px; font-weight: 600; color: #64748b;">
                      Credited directly to your BlindSide account
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 8px 32px 24px 32px;">
              <h2 class="title-text" style="font-size: 19px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; letter-spacing: -0.02em;">
                Hey ${name},
              </h2>
              <p class="body-text" style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 14px 0;">
                We’ve credited <strong>₹${formattedAmount}</strong> to your BlindSide wallet so you can jump right in and find a match.
              </p>
              <p class="body-text" style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                Your balance is ready to use immediately. Set your preferences, get paired up with someone from your campus, and see if the vibe matches.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 26px;">
                    <a href="${targetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #e83a72 0%, #d42466 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 36px; border-radius: 12px; box-shadow: 0 4px 14px rgba(232, 58, 114, 0.35); letter-spacing: -0.01em;">
                      Find Your Match &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Steps: How it works -->
              <div style="border-top: 1px dashed #e2e8f0; margin-bottom: 20px;" class="divider-line"></div>

              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 12px;">
                How BlindSide Works
              </div>

              <!-- Step 1 -->
              <table role="presentation" class="step-card" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #f8fafc; border: 1px solid #eef2f6; border-radius: 10px; padding: 11px 13px; margin-bottom: 8px;">
                <tr>
                  <td width="32" valign="top" style="font-size: 16px; padding-top: 2px;">🎯</td>
                  <td>
                    <div class="step-title" style="font-size: 13px; font-weight: 700; color: #1e293b;">1. Request a Match</div>
                    <div class="step-desc" style="font-size: 12px; color: #64748b; line-height: 1.4; margin-top: 2px;">
                      Choose your preferences and get paired by our matching algorithm.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Step 2 -->
              <table role="presentation" class="step-card" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #f8fafc; border: 1px solid #eef2f6; border-radius: 10px; padding: 11px 13px; margin-bottom: 8px;">
                <tr>
                  <td width="32" valign="top" style="font-size: 16px; padding-top: 2px;">💬</td>
                  <td>
                    <div class="step-title" style="font-size: 13px; font-weight: 700; color: #1e293b;">2. 48-Hour Blind Chat</div>
                    <div class="step-desc" style="font-size: 12px; color: #64748b; line-height: 1.4; margin-top: 2px;">
                      Chat anonymously for 48 hours and get to know each other without superficial bias.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Step 3 -->
              <table role="presentation" class="step-card" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #f8fafc; border: 1px solid #eef2f6; border-radius: 10px; padding: 11px 13px;">
                <tr>
                  <td width="32" valign="top" style="font-size: 16px; padding-top: 2px;">📍</td>
                  <td>
                    <div class="step-title" style="font-size: 13px; font-weight: 700; color: #1e293b;">3. Plan a Meetup</div>
                    <div class="step-desc" style="font-size: 12px; color: #64748b; line-height: 1.4; margin-top: 2px;">
                      Propose a date time and place to meet up in person.
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;" class="step-card divider-line">
              <p class="footer-text" style="font-size: 12px; line-height: 1.5; color: #94a3b8; text-align: center; margin: 0 0 6px 0;">
                You received this email because you have a registered account on <a href="https://blindside.in" style="color: #e83a72; text-decoration: none; font-weight: 600;">BlindSide</a>.
              </p>
              <p class="footer-text" style="font-size: 11px; line-height: 1.4; color: #94a3b8; text-align: center; margin: 0;">
                Questions? Reach out to <a href="mailto:support@blindside.in" style="color: #94a3b8; text-decoration: underline;">support@blindside.in</a><br />
                &copy; ${new Date().getFullYear()} BlindSide. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateDropEmailText({ firstName, amount, appUrl }: DropEmailParams): string {
  const targetUrl = appUrl || "https://blindside.in/dashboard";
  const name = firstName ? firstName.trim() : "there";
  const formattedAmount = Number(amount).toFixed(2);

  return `Hey ${name},

We've added ₹${formattedAmount} to your BlindSide wallet so you can jump right in and find a match.

Your balance is ready to use immediately. Set your preferences, get paired up with someone from your campus, and see if the vibe matches.

Find your match:
${targetUrl}

How BlindSide Works:
1. Request a Match: Choose your preferences and get paired by our matching algorithm.
2. 48-Hour Blind Chat: Chat anonymously for 48 hours and get to know each other without superficial bias.
3. Plan a Meetup: Propose a date time and place to meet up in person.

---
You received this email because you have an account on BlindSide (https://blindside.in).
Need help? Contact support@blindside.in
© ${new Date().getFullYear()} BlindSide. All rights reserved.`;
}
