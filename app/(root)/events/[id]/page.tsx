import Collection from "@/components/shared/Collection";
import CheckoutButton from "@/components/shared/CheckoutButton";
import {
  getEventById,
  getRelatedEventsByCategory,
} from "@/lib/actions/event.actions";
import { formatDateTime } from "@/lib/utils";
import { Calendar, MapPin } from "lucide-react";
import { SearchParamProps } from "@/types";
import Image from "next/image";
import MapPreview from "@/components/shared/MapPreview";

const EventDetails = async ({
  params: { id },
  searchParams,
}: SearchParamProps) => {
  const event = await getEventById(id);

  const relatedEvents = await getRelatedEventsByCategory({
    categoryId: event.category._id,
    eventId: event._id,
    page: searchParams.page as string,
  });

  return (
    <>
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[400px] bg-gradient-to-br from-purple-600 via-blue-600 to-teal-400 overflow-hidden">
        {/* Background Pattern/Particles Effect */}
        <div className="absolute inset-0 bg-[url('/assets/patterns/particles.png')] opacity-30"></div>
        
        {/* Event Image as Background */}
        <div className="absolute inset-0">
          <Image
            src={event.imageUrl}
            alt="Event background"
            fill
            className="object-cover opacity-20 mix-blend-overlay"
            sizes="100vw"
            priority
          />
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 flex items-center min-h-[400px] px-6 py-12">
          <div className="max-w-4xl mx-auto text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {event.title}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-lg">
              <div className="flex items-center gap-2">
                <Image
                  src="/assets/icons/calendar.svg"
                  alt="calendar"
                  width={20}
                  height={20}
                  className="filter-white"
                />
                <span>
                  {formatDateTime(event.startDateTime).dateOnly}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/assets/icons/location-grey.svg"
                  alt="location"
                  width={20}
                  height={20}
                  className="filter-white"
                />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column - Event Details */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* About the Event */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">About the Event</h2>
                <p className="text-gray-700 text-lg leading-relaxed mb-8">
                  {event.description}
                </p>
                
                {/* Single Event Image */}
                <div className="relative w-full h-96 rounded-xl overflow-hidden mb-8">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 70vw"
                    priority
                  />
                </div>
              </div>

              {/* Venue Section - Only show for in-person events */}
              {!event.location?.toLowerCase().includes('online') && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-gray-900">Venue</h2>
                  
                  {/* Map Preview */}
                  <div className="bg-white p-6 rounded-xl border shadow-md">
                    <MapPreview location={event.location} />
                  </div>
                  
                  {/* Venue Details */}
                  <div className="bg-gray-50 p-6 rounded-lg border">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {event.location}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Date & Time</p>
                          <p className="text-gray-600">
                            {formatDateTime(event.startDateTime).dateOnly}
                            {' • '}
                            {formatDateTime(event.startDateTime).timeOnly} - {formatDateTime(event.endDateTime).timeOnly}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Location</p>
                          <p className="text-gray-600">{event.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Organizer Section */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Organizer</h2>
                <div className="bg-white p-6 rounded-lg border">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {event.organizer ? event.organizer.firstName.charAt(0) : 'E'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {event.organizer ? `${event.organizer.firstName} ${event.organizer.lastName}` : 'EventHub Productions'}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Leading event organizers with over 10 years of experience in creating memorable experiences.
                      </p>
                      <button className="text-blue-600 hover:text-blue-800 font-semibold">
                        Contact Organizer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Ticket Booking */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white rounded-lg shadow-lg border p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {event.hasMultipleTicketTypes ? 'Ticket Options' : 'Ticket Price'}
                  </h3>
                  
                  {event.hasMultipleTicketTypes ? (
                    <div className="space-y-4 mb-6">
                      {event.ticketTypes?.map((ticketType: any) => (
                        <div key={ticketType._id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-gray-900">{ticketType.name}</h4>
                              <p className="text-sm text-gray-600">
                                {ticketType.available} of {ticketType.quantity} tickets remaining
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-blue-600">
                                {ticketType.price === 0 ? 'FREE' : `₹${ticketType.price}`}
                              </div>
                              <div className="text-xs text-gray-500">per ticket</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {event.isFree || (event.ticketTypes?.[0]?.price === 0) 
                          ? "FREE" 
                          : `₹${(event.ticketTypes?.[0]?.price || event.price || 0) }`}
                        {!event.isFree && !(event.ticketTypes?.[0]?.price === 0) && (
                          <span className="text-sm font-normal text-gray-600 ml-1">per ticket</span>
                        )}
                      </div>
                      {event.ticketTypes?.[0]?.available !== undefined ? (
                        <div className="text-sm text-gray-600 mb-4">
                          {event.ticketTypes[0].available} of {event.ticketTypes[0].quantity} tickets remaining
                        </div>
                      ) : event.maxTickets && (
                        <div className="text-sm text-gray-600 mb-4">
                          {event.maxTickets - (event.soldTickets || 0)} of {event.maxTickets} tickets remaining
                        </div>
                      )}
                    </>
                  )}
                  

                  <CheckoutButton event={event} />
                  

                  {event.url && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <span className="gray-600">Link: </span>
                      <a 
                        href={event.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm break-all"
                      >
                        {event.url}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Events Section */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Events</h2>
          <Collection
            data={relatedEvents?.data}
            emptyTitle="No Events Found"
            emptyStateSubtext="Come back later"
            collectionType="All_Events"
            limit={3}
            page={searchParams.page as string}
            totalPages={relatedEvents?.totalPages}
          />
        </div>
      </section>
    </>
  );
};

export default EventDetails;