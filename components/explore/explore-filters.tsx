"use client";

import { useEffect, useState } from "react";
import { Search as SearchIcon, MapPin, Calendar, Filter, Grid3X3, List, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";

interface Category {
  _id: string;
  name: string;
}

interface ExploreFiltersProps {
  categories: Category[];
}

export default function ExploreFilters({ categories = [] }: ExploreFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [location, setLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("Popular");

  // Handle search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      let newUrl = '';

      if (searchQuery) {
        newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: 'query',
          value: searchQuery
        });
      } else {
        newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ['query']
        });
      }

      router.push(newUrl, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchParams, router]);

  // Handle category filter change
  const handleCategoryFilter = (categoryId: string) => {
    setActiveFilter(categoryId);
    
    let newUrl = '';
    
    if (categoryId === 'all') {
      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: ['category']
      });
    } else {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'category',
        value: categoryId
      });
    }
    
    router.push(newUrl, { scroll: false });
  };

  // Handle location filter
  const handleLocationChange = (value: string) => {
    setLocation(value);
    
    let newUrl = '';
    
    if (value) {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'location',
        value: value.toLowerCase()
      });
    } else {
      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: ['location']
      });
    }
    
    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Location Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <MapPin
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <SearchIcon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            key="all"
            onClick={() => handleCategoryFilter("all")}
            className={`px-4 py-2 rounded-full border transition-colors ${
              activeFilter === "all"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
            }`}
          >
            All Events
          </button>
          <button
            key="free"
            onClick={() => handleCategoryFilter("free")}
            className={`px-4 py-2 rounded-full border transition-colors ${
              activeFilter === "free"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
            }`}
          >
            Free
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryFilter(category._id)}
              className={`px-4 py-2 rounded-full border transition-colors ${
                activeFilter === category._id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
