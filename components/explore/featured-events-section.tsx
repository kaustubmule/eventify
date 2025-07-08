import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Card, { EventCardProps } from "@/components/shared/Card";

interface FeaturedEventsSectionProps {
  events: EventCardProps[];
}

export default function FeaturedEventsSection({ events }: FeaturedEventsSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Featured Events</h2>
        <Link 
          href="/explore?filter=featured" 
          className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          View all
          <ArrowRight className="ml-1 w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card 
            key={event._id} 
            event={{
              ...event,
              category: event.category || { _id: 'default-category', name: 'Event' },
              organizer: event.organizer || { _id: 'default-organizer', firstName: '', lastName: '' }
            }}
            showAdminControls={false}
          />
        ))}
      </div>
    </section>
  );
}
