import { Schema, model, models, Document } from "mongoose";

export interface IOrder extends Document {
  createdAt: Date;
  razorpayPaymentId: string;
  totalAmount: string;
  event: {
    _id: string;
    title: string;
  };
  buyer: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export type IOrderItem = {
  _id: string;
  totalAmount: string;
  createdAt: Date;
  eventTitle: string;
  eventId: string;
  buyer: string;
};

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
    type: String,
    required: true,
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
});

const Order = models.Order || model("Order", OrderSchema);

export default Order;
