import { NextRequest, NextResponse } from "next/server";
import { LIMITS, hashIp, insertEntry, listApproved, recentCountByVisitor } from "./store";

export const dynamic = "force-dynamic";

// Public: read approved entries
export async function GET() {
  try {
    const entries = await listApproved();
    return NextResponse.json({ entries }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Guestbook GET failed:", error);
    return NextResponse.json({ entries: [], error: "Guestbook is unavailable right now." }, { status: 500 });
  }
}

const clean = (v: unknown, max: number) =>
  typeof v === "string"
    ? // strip control characters, collapse whitespace runs, trim, cap length
      v.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";

// Public: sign the guestbook. New notes wait for approval unless GUESTBOOK_AUTO_APPROVE=true.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // Honeypot: real visitors never see this field, bots fill it. Pretend success.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ ok: true, pending: true });
    }

    const name = clean(body.name, LIMITS.name);
    const message = clean(body.message, LIMITS.message);
    if (name.length < 1 || message.length < 2) {
      return NextResponse.json({ error: "Please add your name and a short note." }, { status: 400 });
    }
    if (/https?:\/\/|www\./i.test(name + " " + message)) {
      return NextResponse.json({ error: "Please leave links out of your note." }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
    const ipHash = hashIp(ip);
    if ((await recentCountByVisitor(ipHash)) >= LIMITS.perHourPerVisitor) {
      return NextResponse.json({ error: "That's plenty of notes for now. Please try again later." }, { status: 429 });
    }

    const approved = process.env.GUESTBOOK_AUTO_APPROVE === "true";
    await insertEntry(name, message, ipHash, approved);
    return NextResponse.json({ ok: true, pending: !approved });
  } catch (error) {
    console.error("Guestbook POST failed:", error);
    return NextResponse.json({ error: "Couldn't save your note. Please try again." }, { status: 500 });
  }
}
