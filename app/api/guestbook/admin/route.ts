import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { deleteEntry, listAll, listPending, setApproved } from "../store";

export const dynamic = "force-dynamic";

// Owner-only moderation. Set GUESTBOOK_ADMIN_TOKEN in the environment, then:
// (The same actions are available in the site: tablet → Settings.)
//   list all     : … -d '{"token":"…","action":"all"}'
//   hide         : … -d '{"token":"…","action":"hide","id":3}'   (back to pending, kept in the database)
//   list pending : curl -X POST <site>/api/guestbook/admin -H 'Content-Type: application/json' -d '{"token":"…","action":"list"}'
//   approve      : … -d '{"token":"…","action":"approve","id":3}'
//   delete       : … -d '{"token":"…","action":"delete","id":3}'
function tokenOk(given: unknown) {
  const expected = process.env.GUESTBOOK_ADMIN_TOKEN;
  if (!expected || typeof given !== "string") return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!process.env.GUESTBOOK_ADMIN_TOKEN) {
    return NextResponse.json({ error: "Moderation is not configured." }, { status: 503 });
  }
  const body = await req.json().catch(() => null);
  if (!body || !tokenOk(body.token)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    if (body.action === "list") return NextResponse.json({ pending: await listPending() });
    if (body.action === "all") return NextResponse.json({ entries: await listAll() });
    const id = Number(body.id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Missing id." }, { status: 400 });
    if (body.action === "approve") {
      await setApproved(id, true);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "hide") {
      await setApproved(id, false);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "delete") {
      await deleteEntry(id);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    console.error("Guestbook admin failed:", error);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
