import * as z from "zod";

// Schema for individual ticket type
const ticketTypeSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Ticket type name is required"),
  price: z.number().min(0, "Price must be 0 or more"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters")
    .max(400, "Description must be less than 400 characters"),
  location: z
    .string()
    .min(3, "Location must be at least 3 characters")
    .max(400, "Location must be less than 400 characters"),
  imageUrl: z.string(),
  startDateTime: z.date(),
  endDateTime: z.date(),
  categoryId: z.string(),
  url: z.string().url(),
  hasMultipleTicketTypes: z.boolean(),
  ticketTypes: z.array(ticketTypeSchema).min(1, "At least one ticket type is required"),
}).refine(data => 
  data.endDateTime > data.startDateTime, 
  {
    message: "End date must be after start date",
    path: ["endDateTime"],
  }
);
