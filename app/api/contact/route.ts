import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { from_name, from_email, message } = await req.json();

    if (!from_name || !from_email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
    const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
    const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;
    const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
    const AUTOREPLY_TEMPLATE_ID = process.env.EMAILJS_AUTOREPLY_TEMPLATE_ID;
    const TO_EMAIL = process.env.EMAILJS_TO_EMAIL;

    if (!SERVICE_ID || !PUBLIC_KEY || !PRIVATE_KEY || !TEMPLATE_ID || !AUTOREPLY_TEMPLATE_ID || !TO_EMAIL) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const EMAILJS_API = "https://api.emailjs.com/api/v1.0/email/send";

    // 1. Send notification email to you
    const notifyRes = await fetch(EMAILJS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        accessToken: PRIVATE_KEY,
        template_params: {
          from_name,
          from_email,
          message,
          email: TO_EMAIL,
        },
      }),
    });

    if (!notifyRes.ok) {
      const err = await notifyRes.text();
      console.error("Notification email failed:", err);
      return NextResponse.json({ error: "Failed to send notification email" }, { status: 500 });
    }

    // 2. Send auto-reply to the user
    const replyRes = await fetch(EMAILJS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: AUTOREPLY_TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        accessToken: PRIVATE_KEY,
        template_params: {
          from_name,
          from_email,
          email: from_email,
        },
      }),
    });

    if (!replyRes.ok) {
      const err = await replyRes.text();
      console.error("Auto-reply email failed:", err);
      // Don't fail the whole request if auto-reply fails
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
