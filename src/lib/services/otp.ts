import crypto from "crypto";

/**
 * Service to handle sending OTP verification codes via Resend (email) and Twilio (SMS).
 * Automatically falls back to console logging when API keys are not configured in local environment.
 */

import { sendEmail, isResendConfigured } from "./resendService";

export async function sendEmailOTP(email: string, otp: string): Promise<boolean> {
  const isDev = process.env.NODE_ENV === "development";

  if (isResendConfigured()) {
    try {
      const subject = "Your access code for BlindSide";
      const html = `
        <div style="font-family: sans-serif; padding: 30px; background-color: #f4f5f7; color: #16192a; border-radius: 16px; max-width: 480px; margin: 0 auto; border: 1px solid #dcdee4;">
          <h2 style="color: #d42466; margin-top: 0; font-weight: 800; text-align: center; letter-spacing: -0.02em;">BlindSide</h2>
          <p style="font-size: 15px; line-height: 1.5; color: #5c6070; text-align: center;">Welcome to your campus blind-dating community. Please verify your email address using the code below:</p>
          <div style="font-size: 36px; font-weight: 800; color: #16192a; text-align: center; letter-spacing: 0.15em; padding: 20px; background-color: #ffffff; border-radius: 12px; border: 1px solid #dcdee4; margin: 24px 0; font-variant-numeric: tabular-nums;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #8b8f9e; text-align: center; margin-bottom: 0; line-height: 1.4;">This code is valid for 10 minutes.<br />If you did not request this code, please ignore this email.</p>
        </div>
      `;
      const text = `Welcome to BlindSide.\n\nYour verification code is: ${otp}\n\nThis code is valid for 10 minutes. If you did not request this code, please ignore this email.`;

      return await sendEmail({
        to: email,
        subject,
        html,
        text,
        replyTo: "support@blindside.in",
        from: process.env.EMAIL_OTP_FROM_ADDRESS || "BlindSide <verify@blindside.in>",
      });
    } catch (err) {
      console.error("Failed to send verification email via Resend:", err);
      return false;
    }
  }

  if (isDev) {
    // Local developer fallback console print
    console.log(`\n==================================================`);
    console.log(`[MOCK EMAIL OTP SENDER]`);
    console.log(`To: ${email}`);
    console.log(`Code: ${otp}`);
    console.log(`(Configure RESEND_API_KEY in .env.local to send real emails via Resend)`);
    console.log(`==================================================\n`);
    return true;
  }

  console.error("Resend is not configured in production environment.");
  return false;
}

export async function sendSMSOTP(phone: string, otp: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && fromNumber) {
    try {
      const authString = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${authString}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: phone.trim(),
            Body: `BlindSide: Your verification code is ${otp}. Valid for 10 minutes.`,
          }),
        }
      );

      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json();
        console.error("Twilio API error response:", errorData);
        return false;
      }
    } catch (err) {
      console.error("Failed to send SMS via Twilio API:", err);
      return false;
    }
  } else {
    // Local developer fallback console print
    console.log(`\n==================================================`);
    console.log(`[MOCK SMS OTP SENDER]`);
    console.log(`To: ${phone}`);
    console.log(`Code: ${otp}`);
    console.log(`(Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env.local to send real SMS)`);
    console.log(`==================================================\n`);
    return true;
  }
}
