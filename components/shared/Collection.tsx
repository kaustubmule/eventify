import { IEvent } from "@/lib/database/models/event.model";
import React from "react";
import Card from "./Card";
import Pagination from "./Pagination";
import { EventCardProps } from "./Card";

type CollectionProps = {
  data: IEvent[];
  emptyTitle: string;
  emptyStateSubtext: string;
  limit: number;
  page: number | string;
  totalPages?: number;
  urlParamName?: string;
  collectionType?: "Events_Organized" | "My_Tickets" | "All_Events";
  showAdminControls?: boolean;
};

// Transform function to convert IEvent to EventCardProps
const transformEventForCard = (event: IEvent): EventCardProps => {
  // Helper function to safely convert ObjectId to string
  const safeToString = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (value.toString) return value.toString();
    if (value.$oid) return value.$oid;
    return String(value);
  };

  return {
    _id: safeToString(event._id),
    title: event.title || '',
    description: event.description,
    location: event.location,
    imageUrl: event.imageUrl || '',
    startDateTime: event.startDateTime,
    price: event.ticketTypes?.[0]?.price || 0,
    isFree: event.isFree,
    hasMultipleTicketTypes: event.hasMultipleTicketTypes,
    ticketTypes: event.ticketTypes?.map(ticket => ({
      _id: safeToString(ticket._id),
      name: ticket.name,
      price: ticket.price,
      quantity: ticket.quantity,
      sold: ticket.sold,
      reserved: ticket.reserved || []
    })),
    category: {
      _id: event.category ? safeToString(event.category._id) : '',
      name: event.category?.name || 'Uncategorized'
    },
    organizer: event.organizer ? {
      _id: safeToString(event.organizer._id),
      firstName: event.organizer.firstName || '',
      lastName: event.organizer.lastName || ''
    } : undefined,
    createdAt: event.createdAt
  };
};

const Collection = ({
  data,
  emptyTitle,
  emptyStateSubtext,
  page,
  totalPages = 0,
  collectionType,
  urlParamName,
  showAdminControls = false,
}: CollectionProps) => {
  return (
    <>
      {data.length > 0 ? (
        <div className="flex flex-col items-center gap-10">
          <ul className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
            {data.map((event) => {
              if (!event || !event._id) return null; // Skip rendering if event is null or missing _id
              
              const hasOrderLink = collectionType === "Events_Organized";
              const hidePrice = collectionType === "My_Tickets";

              // Helper function to safely convert ObjectId to string (moved here for key usage)
              const safeToString = (value: any): string => {
                if (!value) return '';
                if (typeof value === 'string') return value;
                if (value.toString) return value.toString();
                if (value.$oid) return value.$oid;
                return String(value);
              };

              // Transform the event data to match Card component expectations
              const transformedEvent = transformEventForCard(event);

              return (
                <li key={safeToString(event._id)} className="flex justify-center">
                  <Card
                    event={transformedEvent}
                    hasOrderLink={hasOrderLink}
                    hidePrice={hidePrice}
                    showAdminControls={collectionType === "Events_Organized" && showAdminControls}
                  />
                </li>
              );
            })}
          </ul>
          
          {totalPages > 1 && (
            <Pagination
              urlParamName={urlParamName}
              page={page}
              totalPages={totalPages}
            />
          )}
        </div>
      ) : (
        <div className="flex-center wrapper min-h-[200px] w-full flex-col gap-3 rounded-[14px] bg-grey-50 py-28 text-center">
          <h3 className="p-bold-20 md:h5-bold">{emptyTitle}</h3>
          <p className="p-regular-14">{emptyStateSubtext}</p>
        </div>
      )}
    </>
  );
};

export default Collection;