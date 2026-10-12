import { NextResponse, type NextRequest } from "next/server";
import { getSession, effectivePlan } from "@/lib/auth";
import { PLANS, priceIdFor, type PaidPlan } from "@/lib/plans";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/** Formulaire de la page Tarifs → session Stripe Checkout. */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const plan = String(form.get("plan")) as PaidPlan;
  const origin = new URL(request.url).origin;

  if (!(plan in PLANS)) {
    return NextResponse.redirect(`${origin}/tarifs`, { status: 303 });
  }

  const session = await getSession();
  if (!session?.profile) {
    return NextResponse.redirect(`${origin}/inscription`, { status: 303 });
  }
  const { user, profile } = session;

  // Déjà abonné : changement de formule via le portail Stripe.
  if (effectivePlan(profile) !== "free" && profile.stripe_customer_id) {
    const portal = await stripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/compte`,
    });
    return NextResponse.redirect(portal.url, { status: 303 });
  }

  let customerId = profile.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe().customers.create({
      email: user.email,
      name: profile.full_name || undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await createAdminClient().from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const checkout = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: priceIdFor(plan), quantity: 1 }],
    allow_promotion_codes: true,
    locale: "fr",
    subscription_data: { metadata: { user_id: user.id } },
    success_url: `${origin}/dashboard?abonnement=ok`,
    cancel_url: `${origin}/tarifs`,
  });

  return NextResponse.redirect(checkout.url!, { status: 303 });
}
