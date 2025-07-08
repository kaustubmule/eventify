"use server";

import Razorpay from "razorpay";
import { Types } from "mongoose";
import {
  CheckoutOrderParams,
  CreateOrderParams,
  GetOrdersByEventParams,
  GetOrdersByUserParams,
  OrderItem,
} from "@/types";
import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Order from "../database/models/order.model";
import Event from "../database/models/event.model";
import User from "../database/models/user.model";

interface TicketType {
  _id: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  sold?: number;
  reserved?: Array<{
    email: string;
    quantity: number;
    code: string;
  }>;
}

//  CREATE Razorpay Order
export const checkoutOrder = async (order: CheckoutOrderParams) => {
  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  try {
    // Validate ticket availability
    await connectToDatabase();
    const event = await Event.findById(order.eventId);
    if (!event) throw new Error("Event not found");

    // Calculate total amount and validate ticket availability
    let calculatedTotal = 0;
    
    for (const item of order.items) {
      // Skip invalid items
      if (!item.ticketTypeId || item.quantity <= 0) {
        throw new Error("Invalid ticket quantity or type");
      }
      
      const ticketType = (event.ticketTypes as unknown as TicketType[]).find(
        (t) => t._id.toString() === item.ticketTypeId
      );
      
      if (!ticketType) {
        throw new Error(`Ticket type ${item.ticketTypeId} not found`);
      }

      // Calculate reserved quantity
      const reservedQuantity = ticketType.reserved?.reduce(
        (sum, r) => sum + r.quantity, 0
      ) || 0;
      
      // Calculate available tickets
      const sold = ticketType.sold || 0;
      const available = ticketType.quantity - sold - reservedQuantity;
      
      if (available < item.quantity) {
        throw new Error(`Only ${available} tickets available for ${ticketType.name}`);
      }
      
      // Add to total amount
      calculatedTotal += ticketType.price * item.quantity;
    }

    // Verify calculated total matches provided total (with small tolerance for floating point)
    if (Math.abs(calculatedTotal - order.totalAmount) > 1) {
      throw new Error("Order total does not match calculated ticket prices");
    }

    // Create Razorpay order
    const response = await razorpay.orders.create({
      amount: Math.round(calculatedTotal * 100), // Convert to paise
      currency: "INR",
      receipt: `receipt_order_${new Types.ObjectId()}`,
      notes: {
        eventId: order.eventId,
        buyerId: order.buyerId,
        items: JSON.stringify(order.items),
        totalAmount: calculatedTotal.toString(),
      },
    });

    return response;
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
};

//  Create Order in DB
export const createOrder = async (order: CreateOrderParams) => {
  const db = await connectToDatabase();
  const session = await db.startSession();
  
  try {
    session.startTransaction();
    
    // Load event with ticket types
    const event = await Event.findById(order.eventId).session(session);
    if (!event) throw new Error("Event not found");

    // Calculate total and validate ticket availability
    let calculatedTotal = 0;
    const ticketTypes = event.ticketTypes as unknown as TicketType[];
    
    // First pass: validate all items and calculate total
    for (const item of order.items) {
      const ticketType = ticketTypes.find(
        t => t._id.toString() === item.ticketTypeId
      );
      
      if (!ticketType) {
        throw new Error(`Ticket type ${item.ticketTypeId} not found`);
      }
      
      if (item.quantity <= 0) {
        throw new Error(`Invalid quantity for ${ticketType.name}`);
      }
      
      // Calculate reserved quantity
      const reservedQuantity = ticketType.reserved?.reduce(
        (sum, r) => sum + r.quantity, 0
      ) || 0;
      
      // Calculate available tickets
      const sold = ticketType.sold || 0;
      const available = ticketType.quantity - sold - reservedQuantity;
      
      if (available < item.quantity) {
        throw new Error(`Only ${available} tickets available for ${ticketType.name}`);
      }
      
      // Add to total
      calculatedTotal += ticketType.price * item.quantity;
    }
    
    // Verify total matches
    if (Math.abs(calculatedTotal - order.totalAmount) > 1) {
      throw new Error("Order total does not match calculated ticket prices");
    }
    
    // Second pass: update ticket counts
    for (const item of order.items) {
      const ticketType = ticketTypes.find(
        t => t._id.toString() === item.ticketTypeId
      )!;
      
      // Update sold count
      ticketType.sold = (ticketType.sold || 0) + item.quantity;
    }

    // Create the order
    const [newOrder] = await Order.create([{
      ...order,
      event: new Types.ObjectId(order.eventId),
      buyer: new Types.ObjectId(order.buyerId),
      status: 'completed',
      totalAmount: calculatedTotal, // Use calculated total for consistency
      createdAt: new Date(),
    }], { session });

    // Save the updated event with new ticket counts
    await event.save({ session });
    
    await session.commitTransaction();
    
    // Convert to plain object and return
    const result = JSON.parse(JSON.stringify(newOrder));
    return result;
    
  } catch (error) {
    await session.abortTransaction();
    console.error('Order creation error:', error);
    throw error;
  } finally {
    await session.endSession();
  }
};

//  Get Orders by Event
export async function getOrdersByEvent({
  searchString = '',
  eventId,
}: GetOrdersByEventParams) {
  try {
    await connectToDatabase();
    
    if (!eventId) {
      throw new Error("Event ID is required");
    }

    const eventObjectId = new Types.ObjectId(eventId);
    const matchStage: any = {
      event: eventObjectId,
    };

    if (searchString) {
      matchStage.$or = [
        { 'attendeeInfo.name': { $regex: searchString, $options: 'i' } },
        { 'attendeeInfo.email': { $regex: searchString, $options: 'i' } },
      ];
    }

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'buyer',
          foreignField: '_id',
          as: 'buyer',
        },
      },
      { $unwind: '$buyer' },
    ];

    // Only add the $match stage for buyer search if searchString is provided
    if (searchString) {
      pipeline.push({
        $match: {
          $or: [
            { 'buyer.firstName': { $regex: searchString, $options: 'i' } },
            { 'buyer.lastName': { $regex: searchString, $options: 'i' } },
            { 'buyer.email': { $regex: searchString, $options: 'i' } },
          ],
        },
      });
    }

    // Add projection after potential $match stages
    pipeline.push({
      $project: {
        _id: 1,
        totalAmount: 1,
        createdAt: 1,
        status: 1,
        items: 1,
        attendeeInfo: 1,
        buyer: {
          $concat: ['$buyer.firstName', ' ', '$buyer.lastName'],
        },
        buyerEmail: '$buyer.email',
      },
    });

    const orders = await Order.aggregate(pipeline);
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    handleError(error);
    throw error; // Re-throw to allow error handling in the UI
  }
}

//  Get Orders by User
export async function getOrdersByUser({
  userId,
  limit = 3,
  page,
}: GetOrdersByUserParams) {
  try {
    await connectToDatabase();
    const skipAmount = (Number(page) - 1) * limit;
    const conditions = { buyer: userId };

    const orders = await Order.find(conditions)
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(limit)
      .populate({
        path: "event",
        model: Event,
        populate: {
          path: "organizer",
          model: User,
          select: "_id firstName lastName",
        },
      });

    const ordersCount = await Order.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(orders)),
      totalPages: Math.ceil(ordersCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}
