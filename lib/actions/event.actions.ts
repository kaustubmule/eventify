"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/database";
import Event from "@/lib/database/models/event.model";
import User from "@/lib/database/models/user.model";
import Category from "@/lib/database/models/category.model";
import { handleError } from "@/lib/utils";

import {
  CreateEventParams,
  UpdateEventParams,
  DeleteEventParams,
  GetAllEventsParams,
  GetEventsByUserParams,
  GetRelatedEventsByCategoryParams,
} from "@/types";

const getCategoryByName = async (name: string) => {
  return Category.findOne({ name: { $regex: name, $options: "i" } });
};

const populateEvent = (query: any) => {
  return query
    .populate({
      path: "organizer",
      model: User,
      select: "_id firstName lastName",
    })
    .populate({ path: "category", model: Category, select: "_id name" });
};

// CREATE
export async function createEvent({ userId, event, path }: CreateEventParams) {
  try {
    console.log('Starting createEvent with:', { userId, event: { ...event, imageUrl: event.imageUrl ? 'image-url-present' : 'no-image' } });
    
    await connectToDatabase();

    // Validate required fields
    if (!userId) throw new Error('User ID is required');
    if (!event) throw new Error('Event data is required');
    if (!event.title?.trim()) throw new Error('Event title is required');
    if (!event.categoryId) throw new Error('Category is required');
    if (!event.startDateTime) throw new Error('Start date is required');
    if (!event.endDateTime) throw new Error('End date is required');
    if (new Date(event.startDateTime) >= new Date(event.endDateTime)) {
      throw new Error('End date must be after start date');
    }

    // Validate ticket types
    if (!event.ticketTypes?.length) {
      throw new Error('At least one ticket type is required');
    }

    const organizer = await User.findById(userId);
    if (!organizer) throw new Error("Organizer not found");

    // Process ticket types with validation
    const processedTicketTypes = event.ticketTypes.map((ticket, index) => {
      if (!ticket.name?.trim()) {
        throw new Error(`Ticket type #${index + 1} must have a name`);
      }
      if (typeof ticket.price !== 'number' || ticket.price < 0) {
        throw new Error(`Invalid price for ${ticket.name || `ticket type #${index + 1}`}`);
      }
      if (typeof ticket.quantity !== 'number' || ticket.quantity < 1) {
        throw new Error(`Invalid quantity for ${ticket.name || `ticket type #${index + 1}`}`);
      }
      
      return {
        ...ticket,
        _id: new Types.ObjectId(),
        sold: 0,
        reserved: []
      };
    });

    // Create event data
    const eventData = {
      ...event,
      ticketTypes: processedTicketTypes,
      category: event.categoryId,
      organizer: userId,
      isFree: processedTicketTypes.every(t => t.price === 0)
    };

    console.log('Creating event with data:', JSON.stringify(eventData, null, 2));
    
    const newEvent = await Event.create(eventData);
    console.log('Event created successfully:', newEvent._id);

    revalidatePath(path);
    return JSON.parse(JSON.stringify(newEvent));
  } catch (error) {
    console.error('Error in createEvent:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }
    throw new Error('Failed to create event: Unknown error occurred');
  }
}

// GET ONE EVENT BY ID
export async function getEventById(eventId: string) {
  try {
    await connectToDatabase();

    const event = await populateEvent(Event.findById(eventId));
    if (!event) throw new Error("Event not found");

    // Convert to plain object and handle ticket types
    const eventObj = event.toObject();
    
    // Handle cases where ticketTypes is undefined (for backward compatibility)
    if (!eventObj.ticketTypes || !Array.isArray(eventObj.ticketTypes)) {
      // If ticketTypes doesn't exist, create a default one based on legacy fields
      eventObj.ticketTypes = [{
        _id: new Types.ObjectId(),
        name: 'General',
        price: eventObj.price || 0,
        quantity: eventObj.maxTickets || 100,
        sold: 0,
        reserved: [],
        available: (eventObj.maxTickets || 100) - (eventObj.soldTickets || 0)
      }];
      
      // Set hasMultipleTicketTypes flag
      eventObj.hasMultipleTicketTypes = false;
    } else {
      // Calculate available tickets for each type
      eventObj.ticketTypes = eventObj.ticketTypes.map((ticket: any) => ({
        ...ticket,
        available: (ticket.quantity || 0) - 
                  (ticket.sold || 0) - 
                  ((ticket.reserved || []).reduce((sum: number, r: any) => sum + (r.quantity || 0), 0))
      }));
    }

    // Ensure hasMultipleTicketTypes is a boolean
    eventObj.hasMultipleTicketTypes = !!eventObj.hasMultipleTicketTypes;

    return JSON.parse(JSON.stringify(eventObj));
  } catch (error) {
    console.error('Error in getEventById:', error);
    throw new Error(`Failed to get event: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// UPDATE
export async function updateEvent({ userId, event, path }: UpdateEventParams) {
  try {
    await connectToDatabase();

    const eventToUpdate = await Event.findById(event._id);
    if (!eventToUpdate || eventToUpdate.organizer.toHexString() !== userId) {
      throw new Error("Unauthorized or event not found");
    }

    // Preserve existing ticket types' sold and reserved counts
    const existingEvent = await Event.findById(event._id);
    const existingTicketTypes = existingEvent?.ticketTypes || [];

    // Update ticket types while preserving sold and reserved data
    const updatedTicketTypes = event.ticketTypes.map(newTicket => {
      const existingTicket = existingTicketTypes.find(
        (t: any) => t._id.toString() === newTicket._id?.toString()
      );

      return {
        ...newTicket,
        _id: existingTicket?._id || new Types.ObjectId(),
        sold: existingTicket?.sold || 0,
        reserved: existingTicket?.reserved || []
      };
    });

    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      { 
        ...event, 
        ticketTypes: updatedTicketTypes,
        category: event.categoryId,
        isFree: updatedTicketTypes.every(t => t.price === 0)
      },
      { new: true }
    );

    revalidatePath(path);
    return JSON.parse(JSON.stringify(updatedEvent));
  } catch (error) {
    handleError(error);
  }
}

// DELETE
export async function deleteEvent({ eventId, path }: DeleteEventParams) {
  try {
    await connectToDatabase();

    const deletedEvent = await Event.findByIdAndDelete(eventId);
    if (deletedEvent) revalidatePath(path);
  } catch (error) {
    handleError(error);
  }
}

// GET ALL EVENTS
export async function getAllEvents({
  query,
  limit = 6,
  page = 1,
  category,
  location,
  isFree,
}: GetAllEventsParams) {
  try {
    await connectToDatabase();

    // Build the query conditions
    const conditions: any = {};
    
    // Title search
    if (query) {
      conditions.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }
    
    // Category filter - handle both category names and IDs
    if (category) {
      // First check if it's a valid ObjectId (24 character hex string)
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(category);
      
      if (isObjectId) {
        // If it looks like an ObjectId, try to find by _id first
        const categoryById = await Category.findById(category).select('_id');
        if (categoryById) {
          conditions.category = categoryById._id;
        }
      } else {
        // If not an ObjectId or not found by ID, try to find by name
        const categoryDoc = await getCategoryByName(category);
        if (categoryDoc) {
          conditions.category = categoryDoc._id;
        }
      }
    }
    
    // Location filter
    if (location) {
      conditions.location = { $regex: location, $options: 'i' };
    }
    
    // Free events filter
    if (isFree === 'true') {
      conditions.isFree = true;
    }

    // Calculate pagination
    const skipAmount = (Number(page) - 1) * limit;
    
    // Execute query with pagination and sorting
    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit);

    // Populate related fields
    const events = await populateEvent(eventsQuery);
    
    // Get total count for pagination
    const eventsCount = await Event.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}

// GET EVENTS BY ORGANIZER
export async function getEventsByUser({
  userId,
  limit = 6,
  page,
}: GetEventsByUserParams) {
  try {
    await connectToDatabase();

    const conditions = { organizer: userId };
    const skipAmount = (page - 1) * limit;

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(limit);

    const events = await populateEvent(eventsQuery);
    const eventsCount = await Event.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}

// GET RELATED EVENTS: EVENTS WITH SAME CATEGORY
export async function getRelatedEventsByCategory({
  categoryId,
  eventId,
  limit = 3,
  page = 1,
}: GetRelatedEventsByCategoryParams) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;
    const conditions = {
      $and: [{ category: categoryId }, { _id: { $ne: eventId } }],
    };

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(limit);

    const events = await populateEvent(eventsQuery);
    const eventsCount = await Event.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}
