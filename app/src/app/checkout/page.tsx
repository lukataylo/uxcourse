import Link from "next/link";
import { redirect } from "next/navigation";
import { getGeneration } from "@/lib/storage";
import { priceLabel } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { completeMockPayment } from "./actions";

interface SearchParams {
  session?: string;
  generation?: string;
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const generationId = sp.generation;
  const sessionId = sp.session ?? "";
  if (!generationId) redirect("/start");

  const gen = await getGeneration(generationId);
  if (!gen) redirect("/start");

  return (
    <div className="container py-20 max-w-xl">
      <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-3">
        Checkout (mock)
      </p>
      <h1 className="font-serif text-4xl tracking-tight">
        Confirm and generate your course.
      </h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        This is a placeholder for Stripe Checkout. In production, the button below
        would redirect you to Stripe-hosted checkout. See{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          STRIPE_INTEGRATION.md
        </code>{" "}
        in the repo.
      </p>

      <div className="mt-10 rounded-lg border border-border bg-card">
        <div className="p-6 border-b border-border flex items-baseline justify-between">
          <div>
            <div className="text-sm text-muted-foreground">One-off</div>
            <div className="font-serif text-2xl mt-1">
              UX × AI custom course
            </div>
          </div>
          <div className="font-serif text-3xl">{priceLabel()}</div>
        </div>
        <div className="p-6 text-sm text-muted-foreground space-y-2">
          <div className="flex justify-between">
            <span>Role</span>
            <span className="text-foreground">{gen.profile.role}</span>
          </div>
          <div className="flex justify-between">
            <span>Seniority</span>
            <span className="text-foreground capitalize">{gen.profile.seniority}</span>
          </div>
          <div className="flex justify-between">
            <span>Focus areas</span>
            <span className="text-foreground text-right max-w-[60%]">
              {gen.profile.focusAreas.length
                ? gen.profile.focusAreas.length + " selected"
                : "auto"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Time / week</span>
            <span className="text-foreground">{gen.profile.timeBudgetHours} hrs</span>
          </div>
        </div>
        <form action={completeMockPayment} className="p-6 pt-0">
          <input type="hidden" name="generationId" value={gen.id} />
          <input type="hidden" name="sessionId" value={sessionId} />
          <Button type="submit" size="lg" className="w-full">
            <Lock className="h-4 w-4" />
            Pay {priceLabel()} (mock)
          </Button>
          <p className="mt-3 text-xs text-muted-foreground text-center">
            No card will be charged. This is a development stub.
          </p>
        </form>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Changed your mind?{" "}
        <Link href="/start" className="underline hover:text-foreground">
          Edit your profile
        </Link>
        .
      </p>
    </div>
  );
}
