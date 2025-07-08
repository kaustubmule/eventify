  import { Schema, model, models, Document, Types } from "mongoose";

export interface IOrderItem {
  ticketTypeId: Types.ObjectId;
  ticketTypeName: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  createdAt: Date;
  razorpayPaymentId: string;
  totalAmount: number;
  event: {
    _id: string;
    title: string;
  };
  buyer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: IOrderItem[];
  status: 'pending' | 'completed' | 'cancelled';
  attendeeInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export type IOrderItemDisplay = {
  _id: string;
  totalAmount: number;
  createdAt: Date;
  eventTitle: string;
  eventId: string;
  buyer: string;
  status: string;
  items: Array<{
    ticketTypeName: string;
    quantity: number;
    price: number;
  }>;
};

const OrderItemSchema = new Schema({
  ticketTypeId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  ticketTypeName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const OrderSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  razorpayPaymentId: {
    type: String,
    required: true,
    unique: true,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [OrderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
  attendeeInfo: {
    name: String,
    email: String,
    phone: String,
  },
});

const Order = models.Order || model("Order", OrderSchema);

export default Order;
