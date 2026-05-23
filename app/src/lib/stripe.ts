/**
 * Stripe adapter. In MOCK mode (default) this returns a fake checkout session
 * and treats it as immediately paid. See STRIPE_INTEGRATION.md to wire the
 * real Stripe SDK in.
 */

export interface CheckoutSession {
  id: string;
  url: string;
  /** True if MOCK mode returned a synthetic paid session. */
  mock: boolean;
}

export interface CreateCheckoutInput {
  generationId: string;
  email?: string;
}

const PRICE_USD_CENTS = 10000; // $100.00

export async function createCheckoutSession(
  input: CreateCheckoutInput,
): Promise<CheckoutSession> {
  const mock = (process.env.MOCK ?? "true") !== "false";

  if (mock) {
    return {
      id: `cs_mock_${input.generationId}`,
      // Route to our internal /checkout page which simulates the Stripe flow.
      url: `/checkout?session=cs_mock_${input.generationId}&generation=${input.generationId}`,
      mock: true,
    };
  }

  // TODO: real implementation — see STRIPE_INTEGRATION.md
  // const Stripe = (await import("stripe")).default;
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-10-28.acacia" });
  // const session = await stripe.checkout.sessions.create({
  //   mode: "payment",
  //   line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
  //   customer_email: input.email,
  //   metadata: { generationId: input.generationId },
  //   success_url: `${process.env.APP_URL}/generating/${input.generationId}?session={CHECKOUT_SESSION_ID}`,
  //   cancel_url: `${process.env.APP_URL}/start?cancelled=1`,
  // });
  // return { id: session.id, url: session.url!, mock: false };

  throw new Error("Real Stripe not wired yet. See STRIPE_INTEGRATION.md.");
}

export function priceLabel(): string {
  return `$${(PRICE_USD_CENTS / 100).toFixed(0)}`;
}
