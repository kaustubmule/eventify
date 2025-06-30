import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Order from "@/lib/database/models/order.model";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const orderData = await request.json();
    
    // Validate required fields
    if (!orderData.razorpayPaymentId || !orderData.razorpayOrderId || !orderData.eventId || !orderData.buyerId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required order data',
          details: {
            required: ['razorpayPaymentId', 'razorpayOrderId', 'eventId', 'buyerId'],
            received: Object.keys(orderData)
          } 
        },
        { status: 400 }
      );
    }
    
    try {
      // Check if order with this payment ID already exists
      const existingOrder = await Order.findOne({ razorpayPaymentId: orderData.razorpayPaymentId });
      if (existingOrder) {
        return NextResponse.json({
          success: true,
          order: existingOrder,
          message: 'Order already exists'
        });
      }

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
        message: 'Order created successfully'
      });
    } catch (dbError: any) {
      console.error('Database error confirming order:', dbError);
      
      // Handle duplicate key errors specifically
      if (dbError.code === 11000) {
        const existingOrder = await Order.findOne({ razorpayPaymentId: orderData.razorpayPaymentId });
        if (existingOrder) {
          return NextResponse.json({
            success: true,
            order: existingOrder,
            message: 'Order already exists (recovered from race condition)'
          });
        }
      }
      
      throw dbError;
    }
  } catch (error: any) {
    console.error('Error in order confirmation:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to process order',
        code: error.code,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      },
      { status: error.statusCode || 500 }
    );
  }
}
