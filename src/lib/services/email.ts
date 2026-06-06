/**
 * Service to handle sending transactional emails (e.g., photo reveals).
 * Automatically falls back to console logging when Resend API keys are not configured.
 */

interface PhotoRevealParams {
  to: string;
  userName: string;
  partnerName: string;
  partnerPhotoUrl: string | null;
  locationText: string;
  dateTimeStr: string;
}

export async function sendPhotoRevealEmail(params: PhotoRevealParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || "reveal@blindside.app";
  const formattedDate = new Date(params.dateTimeStr).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  });

  const htmlContent = `
    <div style="font-family: sans-serif; padding: 30px; background-color: #f4f5f7; color: #16192a; border-radius: 16px; max-width: 480px; margin: 0 auto; border: 1px solid #dcdee4;">
      <h2 style="color: #d42466; margin-top: 0; font-weight: 800; text-align: center; letter-spacing: -0.02em;">BlindSide Reveal</h2>
      <p style="font-size: 16px; font-weight: bold; color: #16192a; text-align: center; margin-bottom: 20px;">🕵️‍♂️ Code Name: Photo Reveal</p>
      <p style="font-size: 15px; line-height: 1.5; color: #5c6070;">Hey ${params.userName},</p>
      <p style="font-size: 15px; line-height: 1.5; color: #5c6070;">Your date is confirmed for <strong>${formattedDate}</strong> at <strong>${params.locationText}</strong>!</p>
      <p style="font-size: 15px; line-height: 1.5; color: #5c6070;">As promised, here is the reveal of your blind date, <strong>${params.partnerName}</strong>:</p>
      
      <div style="text-align: center; margin: 24px 0;">
        ${
          params.partnerPhotoUrl
            ? `<img src="${params.partnerPhotoUrl}" alt="${params.partnerName}" style="max-width: 200px; border-radius: 12px; border: 3px solid #d42466; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />`
            : `<div style="display: inline-block; padding: 40px 20px; background-color: #ffffff; border-radius: 12px; border: 1px dashed #dcdee4; color: #8b8f9e; font-size: 14px;">No photo uploaded by partner</div>`
        }
      </div>

      <p style="font-size: 14px; line-height: 1.5; color: #5c6070; text-align: center;">See you there! Remember to stay safe and have fun!</p>
      <div style="border-top: 1px solid #dcdee4; margin-top: 24px; padding-top: 16px; text-align: center;">
        <span style="font-size: 12px; color: #8b8f9e;">BlindSide App</span>
      </div>
    </div>
  `;

  if (apiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: params.to.trim().toLowerCase(),
          subject: `BlindSide — Reveal for your date with ${params.partnerName}!`,
          html: htmlContent,
        }),
      });

      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json();
        console.error("Resend Photo Reveal API error response:", errorData);
        return false;
      }
    } catch (err) {
      console.error("Failed to send photo reveal email via Resend:", err);
      return false;
    }
  } else {
    // Local developer fallback console print
    console.log(`\n==================================================`);
    console.log(`[MOCK PHOTO REVEAL EMAIL]`);
    console.log(`To: ${params.to}`);
    console.log(`User: ${params.userName}`);
    console.log(`Partner Name: ${params.partnerName}`);
    console.log(`Partner Photo URL: ${params.partnerPhotoUrl || "None"}`);
    console.log(`Location: ${params.locationText}`);
    console.log(`Time: ${formattedDate}`);
    console.log(`(Configure RESEND_API_KEY in .env.local to send real emails)`);
    console.log(`==================================================\n`);
    return true;
  }
}
