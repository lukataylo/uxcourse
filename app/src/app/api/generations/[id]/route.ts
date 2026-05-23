import { NextResponse } from "next/server";
import { getGeneration } from "@/lib/storage";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const gen = await getGeneration(id);
  if (!gen) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Don't ship the full course over polling — it's potentially big and the
  // /course/[id] route owns rendering. Just the status fields.
  return NextResponse.json({
    id: gen.id,
    status: gen.status,
    progress: gen.progress,
    statusMessage: gen.statusMessage,
    error: gen.error,
    courseId: gen.course?.id,
    updatedAt: gen.updatedAt,
  });
}
