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

    try {
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
        handler: async function (response: any) {
          console.log("Payment success:", response);
          
          // Call our API to confirm the order
          try {
            const orderData = {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              eventId: orderDetails.eventId,
              buyerId: orderDetails.buyerId,
              totalAmount: (parseInt(res.amount.toString()) / 100).toString(),
            };

            const orderResponse = await fetch('/api/orders/confirm', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(orderData),
            });

            if (!orderResponse.ok) {
              throw new Error('Failed to confirm order');
            }

            const orderResult = await orderResponse.json();
            console.log('Order confirmed:', orderResult);
            window.location.href = `/profile?success=true&orderId=${orderResult.order._id}`;
          } catch (error) {
            console.error('Error confirming order:', error);
            alert('Payment was successful but there was an error creating your order. Please contact support with your payment ID: ' + response.razorpay_payment_id);
            window.location.href = '/profile';
          }
        },
        prefill: {
          name: "", // You might want to prefill with user's name
          email: "", // and email
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
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('There was an error processing your payment. Please try again.');
    }
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
