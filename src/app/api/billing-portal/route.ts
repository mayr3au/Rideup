import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const session = await getSession();
  if (!session?.profile) return NextResponse.redirect(`${origin}/connexion`, { status: 303 });

  const customer = session.profile.stripe_customer_id;
  if (!customer) return NextResponse.redirect(`${origin}/tarifs`, { status: 303 });

  const portal = await stripe().billingPortal.sessions.create({
    customer,
    return_url: `${origin}/compte`,
  });
  return NextResponse.redirect(portal.url, { status: 303 });
}
