import { formatDateTime, formatPrice } from "@/lib/utils";
import { auth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Heart, Share } from "lucide-react";
import { DeleteConfirmation } from "./DeleteConfirmation";
import { ShareEvent } from "./ShareEvent"; // Import the new component

export interface ITicketType {
  _id: string | { $oid: string };
  name: string;
  price: number;
  quantity: number;
  sold: number;
  reserved: Array<{
    email: string;
    quantity: number;
    code: string;
  }>;
}

export interface EventCardProps {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  imageUrl: string;
  startDateTime: Date | string;
  price?: string | number;
  isFree: boolean;
  hasMultipleTicketTypes?: boolean;
  ticketTypes?: ITicketType[];
  category: {
    _id: string;
    name: string;
  };
  organizer?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt?: Date | string;
}

type CardProps = {
  event: EventCardProps;
  hasOrderLink?: boolean;
  hidePrice?: boolean;
  showAdminControls?: boolean;
};

const Card = ({ event, hasOrderLink, hidePrice, showAdminControls = false }: CardProps) => {
  const isEventCreator = showAdminControls && event.organizer?._id;

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Generate a gradient based on event ID for demo purposes
  const getGradient = (id: string) => {
    const gradients = [
      'from-blue-500 to-blue-700',
      'from-purple-500 to-pink-500',
      'from-green-500 to-teal-500',
      'from-yellow-400 to-orange-500',
      'from-red-500 to-pink-500',
      'from-indigo-500 to-purple-600'
    ];
    return gradients[parseInt(id.slice(-1)) % gradients.length];
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group w-full">
      {/* Image with gradient overlay */}
      <div className="relative aspect-[16/10] overflow-hidden group">
        {/* Background Image or Gradient */}
        {event.imageUrl ? (
        <Image
        src={event.imageUrl}
        alt={event.title}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(event._id)}`} />
        )}
        
        {/* Radial Gradient Overlay */}
        <div 
          className="absolute inset-0" 
          style={{
            background: 'radial-gradient(circle, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5) 100%)'
          }} 
        />
        
        {/* Top Bar with Category and Action Buttons */}
        <div className="absolute top-4 left-0 right-0 flex justify-between items-start px-4 z-10">
          {/* Category Badge */}
          <div className="max-w-[60%]">
            <span className="bg-gray-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium border border-blue-100 shadow-md whitespace-nowrap overflow-hidden text-ellipsis">
              {event.category?.name || 'Event'}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            {isEventCreator ? (
              // Show Edit/Delete for event creator
              <>
                <Link 
                  href={`/events/${event._id}/update`}
                  className="p-2 bg-gray-50 rounded-full hover:bg-blue-50 transition-all duration-200 border border-blue-100 shadow-sm hover:scale-110 flex-shrink-0"
                  aria-label="Edit event"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(59 130 246)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />  
                  </svg>
                </Link>
                <DeleteConfirmation eventId={event._id} />
              </>
            ) : (
              // Show Like/Share for regular users
              <>
                <button 
                  className="p-2 bg-gray-50 rounded-full hover:bg-red-50 transition-all duration-200 border border-red-100 shadow-sm hover:scale-110 flex-shrink-0"
                  aria-label="Add to favorites"
                >
                  <Heart className="w-4 h-4 text-red-500" />
                </button>
                
                {/* Share Button with Dialog */}
                <ShareEvent 
                  eventId={event._id}
                  eventTitle={event.title}
                  eventDescription={event.description}
                >
                  <button 
                    className="p-2 bg-gray-50 rounded-full hover:bg-blue-50 transition-all duration-200 border border-blue-100 shadow-sm hover:scale-110 flex-shrink-0"
                    aria-label="Share event"
                  >
                    <Share className="w-4 h-4 text-blue-500" />
                  </button>
                </ShareEvent>
              </>
            )}
          </div>
        </div>
        
        {/* Date */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="flex items-center bg-gray-50 text-blue-600 text-sm font-medium px-3 py-1.5 rounded-full border border-blue-100 shadow-sm">
            <Calendar className="w-4 h-4 mr-1.5 text-blue-500" />
            {formatDate(event.startDateTime.toString())}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          <Link 
            href={`/events/${event._id}`}
            className="block truncate"
            title={event.title}
          >
            {event.title}
          </Link>
        </h3>
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600">
            {event.isFree || (event.ticketTypes && event.ticketTypes[0]?.price === 0) 
              ? 'FREE' 
              : formatPrice(
                  String(
                    event.ticketTypes && event.ticketTypes.length > 0 
                      ? event.ticketTypes[0].price 
                      : event.price || 0
                  )
                )}
          </span>
          <Link 
            href={`/events/${event._id}`}
            className="bg-gray-50 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-blue-100 shadow-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Card;