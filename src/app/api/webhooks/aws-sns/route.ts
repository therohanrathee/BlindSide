import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // SNS messages are sent as text/plain content type by default, but have a JSON body.
    // So we read the request as raw text and parse it as JSON.
    const text = await request.text();
    let body: any;
    try {
      body = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse SNS request body as JSON:", e);
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    // Identify SNS Message Type
    const snsType = body.Type || request.headers.get("x-amz-sns-message-type");

    if (snsType === "SubscriptionConfirmation") {
      const subscribeUrl = body.SubscribeURL;
      if (!subscribeUrl) {
        console.error("SubscriptionConfirmation missing SubscribeURL");
        return NextResponse.json({ message: "SubscribeURL required" }, { status: 400 });
      }

      console.log(`Received AWS SNS SubscriptionConfirmation request. Confirming subscription via URL: ${subscribeUrl}`);
      
      const confirmRes = await fetch(subscribeUrl);
      if (confirmRes.ok) {
        console.log("AWS SNS Webhook subscription confirmed successfully!");
        return NextResponse.json({ success: true, message: "Subscription confirmed" });
      } else {
        console.error("Failed to confirm AWS SNS subscription. Response status:", confirmRes.status);
        return NextResponse.json({ message: "Failed to confirm subscription" }, { status: 502 });
      }
    }

    if (snsType === "Notification") {
      let messagePayload: any;
      try {
        messagePayload = typeof body.Message === "string" ? JSON.parse(body.Message) : body.Message;
      } catch (err) {
        console.error("Failed to parse inner SNS message payload:", err);
        return NextResponse.json({ message: "Invalid inner message format" }, { status: 400 });
      }

      const eventType = messagePayload.eventType || messagePayload.notificationType;
      console.log(`Received AWS SES notification. EventType: ${eventType}`);

      const supabase = createAdminClient();
      const recordsToInsert: Array<{ email: string; bounce_type: string }> = [];

      if (eventType === "Bounce") {
        const bounce = messagePayload.bounce;
        const bounceType = bounce?.bounceType || "Bounce";
        const bouncedRecipients = bounce?.bouncedRecipients || [];

        for (const recipient of bouncedRecipients) {
          if (recipient.emailAddress) {
            recordsToInsert.push({
              email: recipient.emailAddress.trim().toLowerCase(),
              bounce_type: `Bounce (${bounceType})`,
            });
          }
        }
      } else if (eventType === "Complaint") {
        const complaint = messagePayload.complaint;
        const complaintFeedbackType = complaint?.complaintFeedbackType || "Complaint";
        const complainedRecipients = complaint?.complainedRecipients || [];

        for (const recipient of complainedRecipients) {
          if (recipient.emailAddress) {
            recordsToInsert.push({
              email: recipient.emailAddress.trim().toLowerCase(),
              bounce_type: `Complaint (${complaintFeedbackType})`,
            });
          }
        }
      }

      if (recordsToInsert.length > 0) {
        console.log(`Logging ${recordsToInsert.length} bounced/complained email(s) to suppression table:`, recordsToInsert);
        const { error } = await supabase
          .from("bounced_emails")
          .upsert(recordsToInsert, { onConflict: "email" });

        if (error) {
          console.error("Failed to insert bounce records to Supabase:", error);
          return NextResponse.json({ message: "Failed to update suppression list" }, { status: 500 });
        }
      }

      return NextResponse.json({ success: true, count: recordsToInsert.length });
    }

    // Default response for other SNS message types (e.g. UnsubscribeConfirmation)
    return NextResponse.json({ success: true, message: `Ignored SNS message type: ${snsType}` });
  } catch (err: any) {
    console.error("Error in AWS SNS Webhook route:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
