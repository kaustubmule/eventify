import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Order from "@/lib/database/models/order.model";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const orderData = await request.json();
    
    // Create the order in the database
    const newOrder = await Order.create({
      razorpayPaymentId: orderData.razorpayPaymentId,
      razorpayOrderId: orderData.razorpayOrderId,
      razorpaySignature: orderData.razorpaySignature,
      event: orderData.eventId,
      buyer: orderData.buyerId,
      totalAmount: orderData.totalAmount,
      createdAt: new Date(),
    });

    // Populate the event and buyer references
    const savedOrder = await Order.findById(newOrder._id)
      .populate('event')
      .populate('buyer');

    return NextResponse.json({
      success: true,
      order: savedOrder,
    });
  } catch (error) {
    console.error('Error confirming order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to confirm order' },
      { status: 500 }
    );
  }
}
