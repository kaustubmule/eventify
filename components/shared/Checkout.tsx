"use client";

import React, { useEffect } from "react";
import { IEvent } from "@/lib/database/models/event.model";
import { Button } from "../ui/button";
import { checkoutOrder } from "@/lib/actions/order.actions";

const Checkout = ({ event, userId }: { event: IEvent; userId: string }) => {
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      console.log("Order placed! You will receive a confirmation soon.");
    }
    if (query.get("canceled")) {
      console.log("Order canceled -- you can try again later.");
    }
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const onCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    const orderDetails = {
      eventTitle: event.title,
      eventId: event._id,
      price: event.price,
      isFree: event.isFree,
      buyerId: userId,
    };

    const res = await checkoutOrder(orderDetails);

    const success = await loadRazorpayScript();
    if (!success) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      amount: res.amount,
      currency: "INR",
      name: event.title,
      description: "Event Ticket Purchase",
      order_id: res.id,
      handler: function (response: any) {
        console.log("Payment success:", response);
        window.location.href = "/profile?success=true";
      },
      prefill: {
        name: "", // Optional
        email: "", // Optional
      },
      notes: {
        eventId: event._id,
        buyerId: userId,
      },
      theme: {
        color: "#6366f1",
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <form onSubmit={onCheckout}>
      <Button type="submit" role="link" size="lg" className="button sm:w-fit">
        {event.isFree ? "Get Ticket" : "Buy Ticket"}
      </Button>
    </form>
  );
};

export default Checkout;
