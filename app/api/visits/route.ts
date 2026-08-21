import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "visits.json");

export async function GET() {
  try {
    // Read the current count
    const fileData = fs.readFileSync(dataFilePath, "utf8");
    const data = JSON.parse(fileData);
    
    // Increment the count
    data.count = (data.count || 0) + 1;
    
    // Write the new count back to the file
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
    
    return NextResponse.json({ count: data.count });
  } catch (error) {
    console.error("Error reading/writing visits.json", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
