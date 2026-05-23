# Wiring up real Stripe

This app ships with a **mocked** checkout (`MOCK=true` by default). To go live:

## 1. Install the Stripe SDK

```bash
cd app
npm install stripe @stripe/stripe-js
```

## 2. Configure environment

Copy `.env.example` to `.env.local` and fill in:

```
MOCK=false
STRIPE_SECRET_KEY=sk_live_...           # or sk_test_... in test mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...         # from the webhook you create below
STRIPE_PRICE_ID=price_...               # a one-off $100 price in your Stripe dashboard
APP_URL=https://your-domain.com
```

Create the price in the Stripe dashboard: Products → New product → one-time, $100 USD.

## 3. Implement the real `createCheckoutSession`

Open `src/lib/stripe.ts` and replace the TODO block with the commented-out
implementation. It already has the right shape; you just need to uncomment and
make sure the API version matches your account.

## 4. Add a webhook handler

Create `src/app/api/webhooks/stripe/route.ts`:

```ts
import Stripe from "stripe";
import { headers } from "next/headers";
import { updateGeneration, getGeneration } from "@/lib/storage";
import { generateCourse } from "@/lib/courseGenerator";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const sig = (await headers()).get("stripe-signature")!;
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const generationId = session.metadata?.generationId;
    if (!generationId) return new Response("missing metadata", { status: 400 });

    await updateGeneration(generationId, {
      status: "paid",
      checkoutSessionId: session.id,
      statusMessage: "Payment received",
    });

    // Kick off generation. In production, replace with a queued job.
    const gen = await getGeneration(generationId);
    if (gen) {
      void (async () => {
        try {
          const course = await generateCourse(gen.profile, {
            onProgress: (progress, message) =>
              updateGeneration(generationId, { progress, statusMessage: message }),
          });
          await updateGeneration(generationId, { status: "ready", progress: 1, course });
        } catch (err) {
          await updateGeneration(generationId, {
            status: "failed",
            error: err instanceof Error ? err.message : String(err),
          });
        }
      })();
    }
  }

  return new Response("ok");
}
```

Register this URL in the Stripe dashboard under **Developers → Webhooks**, select
`checkout.session.completed`, copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

## 5. Stop using the mock `/checkout` page

When `MOCK=false`, `createCheckoutSession` returns a real Stripe-hosted URL.
The redirect in `src/app/start/actions.ts` will send users straight there —
no code change needed.

You can keep `/checkout/page.tsx` around (it'll only be reachable from mock
sessions) or delete it once you're confident.

## 6. Testing locally

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
```

## 7. Refunds & support

The `Generation` record stores `checkoutSessionId`. For refunds, look up the
session in Stripe, refund the payment intent, and either delete or mark the
generation. Add a refund column in admin if this becomes frequent.
