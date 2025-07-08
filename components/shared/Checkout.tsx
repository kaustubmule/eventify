"use client";

import React, { useState, useEffect } from "react";
import { IEvent, ITicketType } from "@/lib/database/models/event.model";
import { Button } from "../ui/button";
import { checkoutOrder } from "@/lib/actions/order.actions";
import { toast } from "@/lib/utils/toast";

const Checkout = ({ event, userId }: { event: IEvent; userId: string }) => {
  const [selectedTicketType, setSelectedTicketType] = useState<string>(
    event.ticketTypes?.[0]?._id.toString() || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get the selected ticket type details
  const selectedTicket = event.ticketTypes?.find(
    (ticket) => ticket._id.toString() === selectedTicketType
  );

  // Calculate total price in paise
  const totalPrice = selectedTicket ? selectedTicket.price * quantity : 0;
  // Convert to rupees for display
  const displayPrice = totalPrice.toFixed(2);
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
    setIsLoading(true);

    if (!selectedTicketType) {
      toast.error("Please select a ticket type");
      setIsLoading(false);
      return;
    }

    // Validate quantity
    const availableTickets = (selectedTicket?.quantity || 0) - (selectedTicket?.sold || 0);
    if (quantity > availableTickets) {
      toast.error(`Only ${availableTickets} tickets available`);
      setIsLoading(false);
      return;
    }

    if (!selectedTicket) {
      throw new Error("Selected ticket not found");
    }

    const orderDetails = {
      eventTitle: event.title,
      eventId: event._id,
      totalAmount: totalPrice, // Already in paise
      buyerId: userId,
      items: [
        {
          ticketTypeId: selectedTicketType,
          ticketTypeName: selectedTicket.name,
          quantity: quantity,
          price: selectedTicket.price,
        },
      ],
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

            const orderResult = await orderResponse.json();
            console.log('Order confirmation response:', orderResult);
            
            // If there's an error in the response, throw it
            if (!orderResponse.ok || orderResult.error) {
              throw new Error(orderResult.error || 'Failed to confirm order');
            }

            // If we get here, order was created successfully
            window.location.href = `/profile?success=true&orderId=${orderResult.order?._id || ''}`;
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
    <form onSubmit={onCheckout} className="w-full space-y-4">
      {event.ticketTypes && event.ticketTypes.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Ticket Type
          </label>
          <select
            className="w-full p-2 border rounded-md"
            value={selectedTicketType}
            onChange={(e) => setSelectedTicketType(e.target.value)}
          >
            {event.ticketTypes.map((ticket) => (
              <option key={ticket._id.toString()} value={ticket._id.toString()}>
                {ticket.name} - ₹{(ticket.price).toFixed(2)}
                {ticket.quantity - (ticket.sold || 0) <= 10 && 
                  ` (${ticket.quantity - (ticket.sold || 0)} left)`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Quantity
        </label>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            className="p-2 border rounded-md hover:bg-gray-100"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span>{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((prev) => prev + 1)}
            className="p-2 border rounded-md hover:bg-gray-100"
            disabled={
              !selectedTicket || 
              quantity >= (selectedTicket.quantity - (selectedTicket.sold || 0))
            }
          >
            +
          </button>
        </div>
      </div>


      <Button
        type="submit"
        role="link"
        size="lg"
        className="w-full"
        disabled={isLoading || !selectedTicketType}
      >
        {isLoading ? "Processing..." : "Buy Ticket"}
      </Button>
    </form>
  );
};

export default Checkout;
