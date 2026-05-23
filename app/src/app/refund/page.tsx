import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { requestRefund } from "./actions";

interface SearchParams {
  ok?: string;
  err?: string;
  gen?: string;
}

export default async function RefundPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  if (sp.ok) {
    return (
      <div className="container py-20 max-w-xl">
        <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Refund requested
        </p>
        <h1 className="font-serif text-4xl tracking-tight">
          We got it. You'll hear back within 24 hours.
        </h1>
        <p className="mt-5 text-muted-foreground leading-relaxed">
          A human reviews every request — usually same-day. We'll email you
          the moment it's processed. If you don't hear back within a day,
          reply to that thread (or email us directly) and we'll dig in.
        </p>
        {sp.gen ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Reference: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{sp.gen}</code>
          </p>
        ) : null}
        <Link
          href="/"
          className="mt-10 inline-flex underline hover:text-foreground"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-16 max-w-xl">
      <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-3">
        Refund request
      </p>
      <h1 className="font-serif text-4xl tracking-tight">
        Ask for a refund.
      </h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Full refund within 14 days, no questions asked. We do reserve the
        right to decline refunds after multiple downloads or repeated refund
        requests. A human reads every one of these.
      </p>

      {sp.err ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {sp.err === "not_found"
            ? "We couldn't find a course matching that email + ID. Double-check both."
            : sp.err === "already_requested"
              ? "A refund has already been requested for this course."
              : sp.err === "already_refunded"
                ? "This course was already refunded."
                : "Something went wrong. Please try again."}
        </div>
      ) : null}

      <form action={requestRefund} className="mt-10 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base">Email used at purchase</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@work.com"
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="generationId" className="text-base">Course ID</Label>
          <p className="text-sm text-muted-foreground">
            Starts with <code className="rounded bg-muted px-1.5 py-0.5 text-xs">gen_</code>. It's in the URL of your course page (e.g. <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/course/gen_abc123</code>).
          </p>
          <Input
            id="generationId"
            name="generationId"
            required
            placeholder="gen_…"
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason" className="text-base">
            Reason{" "}
            <span className="text-sm font-normal text-muted-foreground">(optional)</span>
          </Label>
          <p className="text-sm text-muted-foreground">
            Honestly helps us make this thing better. Not required.
          </p>
          <Textarea
            id="reason"
            name="reason"
            rows={4}
            placeholder="The course wasn't what I expected because…"
          />
        </div>

        <div className="pt-4 flex justify-between items-center border-t border-border">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Cancel
          </Link>
          <Button type="submit" size="lg">
            Request refund
          </Button>
        </div>
      </form>
    </div>
  );
}
