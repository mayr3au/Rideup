import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { planFromPriceId } from "@/lib/plans";

/**
 * Webhook Stripe : seule source de vérité pour le plan de l'utilisateur.
 * Événements à activer dans Stripe : checkout.session.completed,
 * customer.subscription.created / updated / deleted.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return new NextResponse("Signature manquante", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return new NextResponse("Signature invalide", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode === "subscription" && session.subscription) {
        const sub = await stripe().subscriptions.retrieve(String(session.subscription));
        await syncSubscription(sub, session.client_reference_id);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      // Les événements Stripe peuvent arriver dans le désordre : on relit l'état actuel.
      const sub = await stripe().subscriptions.retrieve(event.data.object.id);
      await syncSubscription(sub);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function syncSubscription(sub: Stripe.Subscription, userIdHint?: string | null) {
  const db = createAdminClient();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  // Un abonnement terminé ne doit pas écraser un autre abonnement encore actif du même client.
  if (sub.status === "canceled" || sub.status === "incomplete_expired") {
    const { data: current } = await db.from("profiles").select("stripe_subscription_id").eq("stripe_customer_id", customerId).maybeSingle();
    if (current?.stripe_subscription_id && current.stripe_subscription_id !== sub.id) return;
  }
  const item = sub.items.data[0];
  const ended = sub.status === "canceled" || sub.status === "incomplete_expired";

  const update = {
    stripe_customer_id: customerId,
    stripe_subscription_id: ended ? null : sub.id,
    subscription_status: sub.status,
    plan: ended ? "free" : planFromPriceId(item?.price.id),
    current_period_start: item?.current_period_start ? new Date(item.current_period_start * 1000).toISOString() : null,
    current_period_end: item?.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null,
  };

  const userId = userIdHint ?? sub.metadata?.user_id;
  const query = db.from("profiles").update(update);
  const { error } = userId ? await query.eq("id", userId) : await query.eq("stripe_customer_id", customerId);
  if (error) throw new Error(`Mise à jour du profil impossible : ${error.message}`);
}
