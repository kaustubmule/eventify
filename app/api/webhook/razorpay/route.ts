import { NextResponse } from "next/server";
import crypto from "crypto";
import { createOrder } from "@/lib/actions/order.actions";

export async function POST(request: Request) {
  try {
    // Log the raw request headers for debugging
    const headers = Object.fromEntries(request.headers.entries());
    console.log('🔍 Request Headers:', JSON.stringify(headers, null, 2));
    
    const body = await request.text();
    console.log('📦 Raw Request Body:', body);
    
    const razorpaySignature = request.headers.get("x-razorpay-signature");
    
    if (!razorpaySignature) {
      console.error('❌ Missing x-razorpay-signature header');
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header" }, 
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('❌ RAZORPAY_WEBHOOK_SECRET is not set');
      return NextResponse.json(
        { error: "Server configuration error" }, 
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    console.log('🔑 Signature Verification:', {
      expected: expectedSignature,
      received: razorpaySignature,
      match: expectedSignature === razorpaySignature
    });

    if (expectedSignature !== razorpaySignature) {
      console.error('❌ Invalid signature');
      return NextResponse.json(
        { 
          error: "Invalid signature",
          details: {
            expectedLength: expectedSignature.length,
            receivedLength: razorpaySignature.length,
            first10Expected: expectedSignature.substring(0, 10) + '...',
            first10Received: razorpaySignature.substring(0, 10) + '...'
          }
        }, 
        { status: 400 }
      );
    }

    let event;
    try {
      event = JSON.parse(body);
      console.log('🎯 Event Type:', event.event);
      console.log('📝 Event Data:', JSON.stringify(event, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" }, 
        { status: 400 }
      );
    }

    const eventType = event.event;

    if (eventType === "payment.captured") {
      try {
        const payment = event.payload.payment?.entity;
        if (!payment) {
          throw new Error("Payment data is missing in the event payload");
        }

        const { id, amount, notes } = payment;
        
        if (!id) {
          throw new Error("Payment ID is missing");
        }

        // Validate required fields
        if (!notes?.eventId || !notes?.buyerId) {
          console.error('❌ Missing required fields in payment notes:', { notes });
          return NextResponse.json(
            { error: "Missing required fields in payment notes" },
            { status: 400 }
          );
        }

        // Validate ObjectId format
        const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
        if (!isValidObjectId(notes.buyerId) || !isValidObjectId(notes.eventId)) {
          console.error('❌ Invalid ObjectId format:', { 
            buyerId: notes.buyerId, 
            eventId: notes.eventId 
          });
          return NextResponse.json(
            { error: "Invalid ID format" },
            { status: 400 }
          );
        }

        const orderData = {
          razorpayPaymentId: id,
          eventId: notes.eventId,
          buyerId: notes.buyerId,
          totalAmount: amount ? (amount / 100).toString() : "0",
          createdAt: new Date(),
        };
        
        console.log("🛍️ Creating order with data:", orderData);
        
        try {
          const newOrder = await createOrder(orderData);
          console.log("✅ Order created successfully:", newOrder);
          return NextResponse.json({ 
            success: true, 
            message: "Order created successfully",
            order: newOrder 
          });
        } catch (createError) {
          console.error("❌ Failed to create order:", createError);
          return NextResponse.json(
            { 
              success: false,
              error: "Failed to create order in database",
              details: createError instanceof Error ? createError.message : String(createError)
            },
            { status: 500 }
          );
        }
      } catch (processError) {
        console.error("❌ Error processing payment.captured event:", processError);
        return NextResponse.json(
          { 
            success: false,
            error: "Error processing payment",
            details: processError instanceof Error ? processError.message : String(processError)
          },
          { status: 400 }
        );
      }
    } else {
      console.log("ℹ️ Unhandled event type:", eventType);
      return NextResponse.json(
        { 
          success: true, 
          message: "Event received but not processed" 
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("❌ Unhandled error in webhook handler:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
