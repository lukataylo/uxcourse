import Link from "next/link";
import { listGenerations } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const gens = await listGenerations();

  return (
    <div className="container py-16 max-w-5xl">
      <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-3">
        Admin · unauthenticated · hidden route
      </p>
      <h1 className="font-serif text-4xl tracking-tight">Recent generations</h1>
      <p className="mt-3 text-muted-foreground">
        Local file store: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">app/data/generations.json</code>
      </p>

      {gens.length === 0 ? (
        <div className="mt-12 rounded-md border border-dashed border-border p-10 text-center text-muted-foreground">
          No generations yet. <Link href="/start" className="underline">Start one</Link>.
        </div>
      ) : (
        <div className="mt-10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-3 pr-4 font-medium">When</th>
                <th className="py-3 pr-4 font-medium">Role</th>
                <th className="py-3 pr-4 font-medium">Seniority</th>
                <th className="py-3 pr-4 font-medium">Focus</th>
                <th className="py-3 pr-4 font-medium">Hrs</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Open</th>
              </tr>
            </thead>
            <tbody>
              {gens.map((g) => (
                <tr key={g.id} className="border-b border-border/60">
                  <td className="py-3 pr-4 text-muted-foreground">
                    {new Date(g.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 pr-4">{g.profile.role}</td>
                  <td className="py-3 pr-4 capitalize">{g.profile.seniority}</td>
                  <td className="py-3 pr-4">{g.profile.focusAreas.length}</td>
                  <td className="py-3 pr-4">{g.profile.timeBudgetHours}</td>
                  <td className="py-3 pr-4">
                    <StatusPill status={g.status} progress={g.progress} />
                  </td>
                  <td className="py-3 pr-4">
                    {g.status === "ready" ? (
                      <Link href={`/course/${g.id}`} className="underline">course</Link>
                    ) : (
                      <Link href={`/generating/${g.id}`} className="underline">status</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status, progress }: { status: string; progress: number }) {
  const colors: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    paid: "bg-blue-100 text-blue-900",
    generating: "bg-amber-100 text-amber-900",
    ready: "bg-emerald-100 text-emerald-900",
    failed: "bg-red-100 text-red-900",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${colors[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
      {status === "generating" ? ` · ${Math.round(progress * 100)}%` : ""}
    </span>
  );
}
