import { getGeneration } from "@/lib/storage";
import { courseToMarkdown } from "@/lib/markdown";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "md";

  const gen = await getGeneration(id);
  if (!gen || !gen.course) {
    return new Response("not_found", { status: 404 });
  }

  if (format === "md") {
    const md = courseToMarkdown(gen.course);
    const safeTitle = gen.course.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return new Response(md, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeTitle}.md"`,
      },
    });
  }

  return new Response("unsupported_format", { status: 400 });
}
