import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.TEMPLATE_URL;
  if (!url) {
    return NextResponse.json(
      { error: "Template URL not configured" },
      { status: 503 }
    );
  }
  return NextResponse.redirect(url);
}
