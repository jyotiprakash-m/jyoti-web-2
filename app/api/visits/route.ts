import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is missing");
    }
    const sql = neon(process.env.DATABASE_URL);

    // Create table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS site_stats (
        key VARCHAR(255) PRIMARY KEY,
        value INTEGER DEFAULT 0
      )
    `;

    // Increment the visit counter atomically
    const result = await sql`
      INSERT INTO site_stats (key, value) 
      VALUES ('portfolio_visits', 1)
      ON CONFLICT (key) 
      DO UPDATE SET value = site_stats.value + 1
      RETURNING value
    `;

    const count = result[0].value;
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error connecting to Neon Database:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
