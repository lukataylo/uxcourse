import { NextResponse } from "next/server";
import { recordDownload } from "@/lib/storage";

/**
 * Lightweight beacon used by the print tracker on the course page. Markdown
 * downloads are tracked inline in the /download route; this exists so the
 * print button (which lives in a sibling client component we can't touch) can
 * still log to `downloadsAt`.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const updated = await recordDownload(id);
  if (!updated) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
