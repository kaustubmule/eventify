import ExploreHero from "@/components/explore/explore-hero";
import ExploreFilters from "@/components/explore/explore-filters";
import FeaturedEventsSection from "@/components/explore/featured-events-section";
import { EventCardProps } from "@/components/shared/Card";
import NewsletterSignup from "@/components/explore/newsletter-signup";
import { getAllEvents } from '@/lib/actions/event.actions';
import { getAllCategories } from '@/lib/actions/category.actions';
import { SearchParamProps } from "@/types";

interface Category {
  _id: string;
  name: string;
}

interface EventsResponse {
  data: EventCardProps[];
  totalPages: number;
}

export default async function ExplorePage({ searchParams }: SearchParamProps) {
  // Extract search and filter parameters from URL
  const searchText = (searchParams?.query as string) || '';
  const category = (searchParams?.category as string) || '';
  const location = (searchParams?.location as string) || '';
  
  // Fetch events with filters
  const eventsResponse = await getAllEvents({
    query: searchText,
    category: category === 'free' ? '' : category, // Handle special 'free' case
    location,
    page: 1,
    limit: 100, // Adjust limit as needed
    isFree: category === 'free' ? 'true' : ''
  }) as unknown as EventsResponse; // Cast to our expected response type
  
  // Fetch categories for filters
  const categories = await getAllCategories() as Category[];

  return (
    <>
   
    <div className="min-h-screen bg-gray-50">
      <ExploreHero />
      <ExploreFilters categories={categories} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <FeaturedEventsSection events={eventsResponse?.data?.map(event => ({
          ...event,
          // Ensure all required fields are present
          description: event.description || '',
          location: event.location || 'Location not specified',
          imageUrl: event.imageUrl || '/assets/images/placeholder.svg',
          category: event.category || { _id: 'default-category', name: 'Event' },
          organizer: event.organizer || { _id: 'default-organizer', firstName: '', lastName: '' }
        })) || []} />

      </div>
      <NewsletterSignup />
    </div>
    </>
  );
}
