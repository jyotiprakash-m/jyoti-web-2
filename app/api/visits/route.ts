import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET() {
  try {
    // Increment the 'portfolio_visits' key by 1 in Vercel KV
    const count = await kv.incr("portfolio_visits");
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error connecting to Vercel KV", error);
    // Return a fallback count if KV fails
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
