import { notFound } from "next/navigation";
import { getGeneration } from "@/lib/storage";
import { GenerationStatusView } from "./status-view";

export default async function GeneratingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gen = await getGeneration(id);
  if (!gen) notFound();

  return (
    <div className="container py-20 max-w-xl">
      <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-3">
        Generating
      </p>
      <h1 className="font-serif text-4xl tracking-tight">
        Your course is being written.
      </h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        We're composing modules, drafting lessons, sourcing citations, and sizing
        exercises to your time budget. This typically takes under a minute in the
        mock pipeline; the real pipeline will take longer.
      </p>

      <GenerationStatusView
        id={gen.id}
        initialStatus={gen.status}
        initialProgress={gen.progress}
        initialMessage={gen.statusMessage}
      />
    </div>
  );
}
