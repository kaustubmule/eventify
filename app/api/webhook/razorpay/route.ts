import { NextResponse } from "next/server";
import crypto from "crypto";
import { createOrder } from "@/lib/actions/order.actions";

export async function POST(request: Request) {
  const body = await request.text();
  const razorpaySignature = request.headers.get(
    "x-razorpay-signature"
  ) as string;
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  const eventType = event.event;

  if (eventType === "payment.captured") {
    const payment = event.payload.payment.entity;
    const { id, amount, notes } = payment;

    const order = {
      stripeId: id,
      eventId: notes?.eventId || "",
      buyerId: notes?.buyerId || "",
      totalAmount: amount ? (amount / 100).toString() : "0",
      createdAt: new Date(),
    };

    const newOrder = await createOrder(order);
    return NextResponse.json({ message: "OK", order: newOrder });
  }

  return new Response("", { status: 200 });
}
