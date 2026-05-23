import Link from "next/link";
import { listGenerations } from "@/lib/storage";
import type { Generation } from "@/lib/types";
import { approveRefund } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const gens = await listGenerations();
  const refundRequests = gens.filter((g) => g.refundStatus === "requested");

  return (
    <div className="container py-16 max-w-5xl">
      <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-3">
        Admin · unauthenticated · hidden route
      </p>
      <h1 className="font-serif text-4xl tracking-tight">Recent generations</h1>
      <p className="mt-3 text-muted-foreground">
        Local file store: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">app/data/generations.json</code>
      </p>

      {refundRequests.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-serif text-2xl tracking-tight">
            Refund requests ({refundRequests.length})
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Approving fires the mock refund email and marks the record. In real
            mode this is where the Stripe refund call goes.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-3 pr-4 font-medium">Requested</th>
                  <th className="py-3 pr-4 font-medium">Email</th>
                  <th className="py-3 pr-4 font-medium">Course</th>
                  <th className="py-3 pr-4 font-medium">Signals</th>
                  <th className="py-3 pr-4 font-medium">Reason</th>
                  <th className="py-3 pr-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {refundRequests.map((g) => (
                  <tr key={g.id} className="border-b border-border/60 align-top">
                    <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                      {g.refundRequestedAt
                        ? new Date(g.refundRequestedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="py-3 pr-4 break-all">{g.email ?? "—"}</td>
                    <td className="py-3 pr-4">
                      <Link href={`/course/${g.id}`} className="underline">
                        {g.id}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <AbuseSignals gen={g} />
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground max-w-[20ch]">
                      {g.refundReason ? (
                        <span title={g.refundReason}>
                          {g.refundReason.length > 60
                            ? g.refundReason.slice(0, 60) + "…"
                            : g.refundReason}
                        </span>
                      ) : (
                        <span className="opacity-60">(none)</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <form action={approveRefund}>
                        <input
                          type="hidden"
                          name="generationId"
                          value={g.id}
                        />
                        <button
                          type="submit"
                          className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                        >
                          Approve refund
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="font-serif text-2xl tracking-tight">All generations</h2>

        {gens.length === 0 ? (
          <div className="mt-6 rounded-md border border-dashed border-border p-10 text-center text-muted-foreground">
            No generations yet. <Link href="/start" className="underline">Start one</Link>.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-3 pr-4 font-medium">When</th>
                  <th className="py-3 pr-4 font-medium">Email</th>
                  <th className="py-3 pr-4 font-medium">Role</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Refund</th>
                  <th className="py-3 pr-4 font-medium">Downloads</th>
                  <th className="py-3 pr-4 font-medium">Email sent</th>
                  <th className="py-3 pr-4 font-medium">Open</th>
                </tr>
              </thead>
              <tbody>
                {gens.map((g) => (
                  <tr key={g.id} className="border-b border-border/60 align-top">
                    <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                      {new Date(g.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 break-all max-w-[20ch]">
                      {g.email ?? "—"}
                      {g.priorRefund ? (
                        <span
                          className="ml-2 inline-flex items-center rounded-full bg-amber-100 text-amber-900 px-1.5 py-0.5 text-[10px]"
                          title="Buyer had a prior refunded purchase"
                        >
                          prior refund
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4">{g.profile.role}</td>
                    <td className="py-3 pr-4">
                      <StatusPill status={g.status} progress={g.progress} />
                    </td>
                    <td className="py-3 pr-4">
                      <RefundPill status={g.refundStatus} />
                    </td>
                    <td className="py-3 pr-4">
                      {g.downloadsAt.length}
                      {g.downloadsAt.length > 0 ? (
                        <div
                          className="text-[10px] text-muted-foreground"
                          title={g.downloadsAt.join("\n")}
                        >
                          last{" "}
                          {new Date(
                            g.downloadsAt[g.downloadsAt.length - 1],
                          ).toLocaleString()}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 text-xs">
                      {g.emailDeliveredAt ? (
                        <span className="text-emerald-700">
                          {new Date(g.emailDeliveredAt).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">not yet</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {g.status === "ready" ? (
                        <Link
                          href={`/course/${g.id}`}
                          className="underline"
                        >
                          course
                        </Link>
                      ) : (
                        <Link
                          href={`/generating/${g.id}`}
                          className="underline"
                        >
                          status
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
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

function RefundPill({ status }: { status: Generation["refundStatus"] }) {
  if (status === "none") {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const colors: Record<string, string> = {
    requested: "bg-amber-100 text-amber-900",
    approved: "bg-emerald-100 text-emerald-900",
    declined: "bg-red-100 text-red-900",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${colors[status]}`}
    >
      {status}
    </span>
  );
}

/**
 * Surface (don't enforce) two patterns that often correlate with abuse:
 *   1. download-then-refund   — flag with the time delta
 *   2. prior refund on file   — buyer has refunded before under this email
 * Humans decide. We never auto-deny.
 */
function AbuseSignals({ gen }: { gen: Generation }) {
  const flags: React.ReactNode[] = [];

  if (gen.refundRequestedAt && gen.downloadsAt.length > 0) {
    const lastDownload = new Date(
      gen.downloadsAt[gen.downloadsAt.length - 1],
    ).getTime();
    const requested = new Date(gen.refundRequestedAt).getTime();
    if (lastDownload <= requested) {
      flags.push(
        <span
          key="dtr"
          className="inline-flex items-center rounded-full bg-red-100 text-red-900 px-1.5 py-0.5 text-[10px]"
          title={`Last download ${new Date(lastDownload).toLocaleString()} · refund requested ${new Date(requested).toLocaleString()}`}
        >
          download → refund · {fmtDelta(requested - lastDownload)} ·{" "}
          {gen.downloadsAt.length}×
        </span>,
      );
    }
  }

  if (gen.priorRefund) {
    flags.push(
      <span
        key="prior"
        className="inline-flex items-center rounded-full bg-amber-100 text-amber-900 px-1.5 py-0.5 text-[10px]"
        title="Buyer had a prior refunded purchase under this email"
      >
        prior refund
      </span>,
    );
  }

  if (flags.length === 0) {
    return <span className="text-xs text-muted-foreground">clean</span>;
  }
  return <div className="flex flex-wrap gap-1">{flags}</div>;
}

function fmtDelta(ms: number): string {
  if (ms < 0) return "—";
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
}
