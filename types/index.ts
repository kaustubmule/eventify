// ====== USER PARAMS
export type CreateUserParams = {
  clerkId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  photo: string;
};

export type UpdateUserParams = {
  firstName: string;
  lastName: string;
  username: string;
  photo: string;
};

// ====== TICKET TYPES
export type TicketType = {
  _id?: string;
  name: string;
  price: number;
  quantity: number;
  sold?: number;
  reserved?: Array<{
    email: string;
    quantity: number;
    code: string;
  }>;
};

// ====== EVENT PARAMS
export type CreateEventParams = {
  userId: string;
  event: {
    title: string;
    description: string;
    location: string;
    imageUrl: string;
    startDateTime: Date;
    endDateTime: Date;
    categoryId: string;
    ticketTypes: TicketType[];
    hasMultipleTicketTypes: boolean;
    url: string;
  };
  path: string;
};

export type UpdateEventParams = {
  userId: string;
  event: {
    _id: string;
    title: string;
    description: string;
    location: string;
    imageUrl: string;
    startDateTime: Date;
    endDateTime: Date;
    categoryId: string;
    ticketTypes: TicketType[];
    hasMultipleTicketTypes: boolean;
    url: string;
  };
  path: string;
};

export type DeleteEventParams = {
  eventId: string;
  path: string;
};

export type GetAllEventsParams = {
  query: string;
  category: string;
  location?: string;
  isFree?: string;
  limit: number;
  page: number;
};

export type GetEventsByUserParams = {
  userId: string;
  limit?: number;
  page: number;
};

export type GetRelatedEventsByCategoryParams = {
  categoryId: string;
  eventId: string;
  limit?: number;
  page: number | string;
};

export type Event = {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  startDateTime: Date;
  endDateTime: Date;
  url: string;
  isFree: boolean;
  ticketTypes: TicketType[];
  hasMultipleTicketTypes: boolean;
  organizer: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  category: {
    _id: string;
    name: string;
  };
};

// ====== CATEGORY PARAMS
export type CreateCategoryParams = {
  categoryName: string;
};

// ====== ORDER PARAMS
export type OrderItem = {
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  price: number;
};

export type CheckoutOrderParams = {
  eventId: string;
  buyerId: string;
  items: OrderItem[];
  totalAmount: number;
};

export type CreateOrderParams = {
  razorpayPaymentId: string;
  eventId: string;
  buyerId: string;
  items: OrderItem[];
  totalAmount: number;
  attendeeInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: Date;
};

export type GetOrdersByEventParams = {
  eventId: string;
  searchString: string;
};

export type GetOrdersByUserParams = {
  userId: string | null;
  limit?: number;
  page: string | number | null;
};

// ====== URL QUERY PARAMS
export type UrlQueryParams = {
  params: string;
  key: string;
  value: string | null;
};

export type RemoveUrlQueryParams = {
  params: string;
  keysToRemove: string[];
};

export type SearchParamProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};
