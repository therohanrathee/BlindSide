/**
 * Beautiful, responsive, dark/light mode compatible email template
 * for wallet credit drops sent from drops@blindside.in.
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
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>🎁 You received ₹${amount} in your BlindSide Wallet!</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
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
        background-color: #0b0c10 !important;
      }
      .card-box {
        background-color: #14161f !important;
        border: 1px solid #252839 !important;
        color: #f1f5f9 !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4) !important;
      }
      .title-text {
        color: #ffffff !important;
      }
      .body-text {
        color: #cbd5e1 !important;
      }
      .badge-bg {
        background-color: rgba(232, 58, 114, 0.15) !important;
        border-color: rgba(232, 58, 114, 0.35) !important;
      }
      .amount-text {
        color: #fb7185 !important;
      }
      .step-card {
        background-color: #1a1d2b !important;
        border: 1px solid #272b3e !important;
      }
      .step-title {
        color: #f8fafc !important;
      }
      .step-desc {
        color: #94a3b8 !important;
      }
      .divider-line {
        border-color: #252839 !important;
      }
      .footer-text {
        color: #64748b !important;
      }
    }
  </style>
</head>
<body class="body-bg" style="margin: 0; padding: 24px 12px; background-color: #f4f5f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" align="center">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" class="card-box" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06); overflow: hidden; margin: 0 auto;">
          
          <!-- Brand Header -->
          <tr>
            <td align="center" style="padding: 32px 28px 16px 28px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <span style="font-size: 24px; font-weight: 900; letter-spacing: -0.04em; color: #e83a72; text-transform: uppercase;">BLINDSIDE</span>
                    <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #94a3b8; margin-top: 4px;">Campus Blind Dating</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Credit Drop Banner -->
          <tr>
            <td align="center" style="padding: 12px 28px 20px 28px;">
              <table role="presentation" class="badge-bg" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, rgba(232, 58, 114, 0.08) 0%, rgba(244, 114, 182, 0.12) 100%); border-radius: 16px; border: 1px solid rgba(232, 58, 114, 0.25); padding: 24px 20px; text-align: center;">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #e83a72; background: rgba(232, 58, 114, 0.12); border-radius: 9999px; padding: 4px 12px; margin-bottom: 8px;">
                      🎁 Special Credit Drop
                    </span>
                    <div class="amount-text" style="font-size: 40px; font-weight: 900; color: #e83a72; letter-spacing: -0.03em; margin: 6px 0; font-variant-numeric: tabular-nums;">
                      +₹${formattedAmount}
                    </div>
                    <div style="font-size: 13px; font-weight: 600; color: #64748b;">
                      Credited directly to your BlindSide Wallet
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 10px 32px 24px 32px;">
              <h2 class="title-text" style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; letter-spacing: -0.02em;">
                Hey ${name}, your match is waiting! 👋
              </h2>
              <p class="body-text" style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 16px 0;">
                We just added <strong>₹${formattedAmount}</strong> in free credits to your BlindSide account. You're now fully set to start matching right away.
              </p>
              <p class="body-text" style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                Put your phone on blind mode, explore verified profiles from your campus, and let our algorithm set you up on an exciting coffee or dinner date!
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 28px;">
                    <a href="${targetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #e83a72 0%, #d42466 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 800; padding: 15px 36px; border-radius: 12px; box-shadow: 0 4px 16px rgba(232, 58, 114, 0.35); letter-spacing: -0.01em;">
                      Start Matching Now &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Steps: How it works -->
              <div style="border-top: 1px dashed #e2e8f0; margin-bottom: 24px;" class="divider-line"></div>

              <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 14px;">
                How BlindSide Works:
              </div>

              <!-- Step 1 -->
              <table role="presentation" class="step-card" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #f8fafc; border: 1px solid #eef2f6; border-radius: 12px; padding: 12px 14px; margin-bottom: 10px;">
                <tr>
                  <td width="36" valign="top" style="font-size: 18px; padding-top: 2px;">🎯</td>
                  <td>
                    <div class="step-title" style="font-size: 14px; font-weight: 700; color: #1e293b;">1. Request Your Match</div>
                    <div class="step-desc" style="font-size: 12px; color: #64748b; line-height: 1.4; margin-top: 2px;">
                      Choose your preferred vibe, gender, and dietary preferences.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Step 2 -->
              <table role="presentation" class="step-card" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #f8fafc; border: 1px solid #eef2f6; border-radius: 12px; padding: 12px 14px; margin-bottom: 10px;">
                <tr>
                  <td width="36" valign="top" style="font-size: 18px; padding-top: 2px;">💬</td>
                  <td>
                    <div class="step-title" style="font-size: 14px; font-weight: 700; color: #1e293b;">2. 72-Hour Blind Chat</div>
                    <div class="step-desc" style="font-size: 12px; color: #64748b; line-height: 1.4; margin-top: 2px;">
                      Connect without superficial bias using fun icebreakers.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Step 3 -->
              <table role="presentation" class="step-card" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #f8fafc; border: 1px solid #eef2f6; border-radius: 12px; padding: 12px 14px;">
                <tr>
                  <td width="36" valign="top" style="font-size: 18px; padding-top: 2px;">☕</td>
                  <td>
                    <div class="step-title" style="font-size: 14px; font-weight: 700; color: #1e293b;">3. Meet at a Partner Cafe</div>
                    <div class="step-desc" style="font-size: 12px; color: #64748b; line-height: 1.4; margin-top: 2px;">
                      Propose a date and meet up safely at a curated venue.
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Information -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;" class="step-card divider-line">
              <p class="footer-text" style="font-size: 12px; line-height: 1.5; color: #94a3b8; text-align: center; margin: 0 0 8px 0;">
                You received this account alert because you have a registered account on <a href="https://blindside.in" style="color: #e83a72; text-decoration: none; font-weight: 600;">BlindSide</a>.
              </p>
              <p class="footer-text" style="font-size: 11px; line-height: 1.4; color: #94a3b8; text-align: center; margin: 0;">
                Have questions or need support? Reach us at <a href="mailto:support@blindside.in" style="color: #94a3b8; text-decoration: underline;">support@blindside.in</a><br />
                &copy; ${new Date().getFullYear()} BlindSide Dating. All rights reserved.
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

Great news! We've just dropped ₹${formattedAmount} into your BlindSide Wallet.

Your updated balance is ready to use immediately. You're now fully set to start matching right away and meet someone exciting on campus.

Start matching now:
${targetUrl}

How BlindSide Works:
1. Request Your Match: Choose your preferences, campus, and vibe.
2. 72-Hour Blind Chat: Chat without superficial bias using fun icebreakers.
3. Meet at a Partner Cafe: Lock in a date and meet up safely!

---
Why did you receive this?
You received this notification because you have a registered account on BlindSide (https://blindside.in).
Need help? Contact support@blindside.in
© ${new Date().getFullYear()} BlindSide Dating. All rights reserved.`;
}
