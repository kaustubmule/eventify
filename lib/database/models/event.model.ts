import { Document, Schema, model, models, Types } from "mongoose";

export interface ITicketType {
  _id: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  reserved: {
    email: string;
    quantity: number;
    code: string;
  }[];
}

export interface IEvent extends Document {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  createdAt: Date;
  imageUrl: string;
  startDateTime: Date;
  endDateTime: Date;
  isFree: boolean;
  url?: string;
  category: { _id: string; name: string };
  organizer: { _id: string; firstName: string; lastName: string };
  ticketTypes: ITicketType[];
  hasMultipleTicketTypes: boolean;
}

const TicketTypeSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0 },
  sold: { type: Number, default: 0 },
  reserved: [{
    email: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    code: { type: String, required: true },
  }]
}, { _id: true });

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
  imageUrl: { type: String, required: true },
  startDateTime: { type: Date, default: Date.now },
  endDateTime: { type: Date, default: Date.now },
  isFree: { type: Boolean, default: false },
  url: { type: String },
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  organizer: { type: Schema.Types.ObjectId, ref: "User" },
  ticketTypes: { type: [TicketTypeSchema], default: [] },
  hasMultipleTicketTypes: { type: Boolean, default: false },
});

const Event = models.Event || model("Event", EventSchema);

export default Event;
