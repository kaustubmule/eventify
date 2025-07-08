'use client';

import { useState, useEffect } from 'react';

interface MapPreviewProps {
  location?: string;
  className?: string;
}

export default function MapPreview({ 
  location = 'Mumbai, India',
  className = 'h-96 w-full rounded-lg'
}: MapPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the API key from environment variables
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    // Check if API key is available
    if (!apiKey) {
      setError('Google Maps API key not found');
      setIsLoading(false);
      return;
    }

    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [apiKey]);

  // Construct the Google Maps Embed URL
  const mapUrl = apiKey 
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(location)}&zoom=15&maptype=roadmap`
    : '';

  // Fallback: Simple Google Maps link if embed fails
  const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold mb-4">Location</h3>
      
      {/* Map Container with Fixed Height */}
      <div className="w-full h-80 rounded-lg overflow-hidden shadow-md bg-gray-100">
        {isLoading && (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        
        {error && !isLoading && (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center text-gray-600">
              <p className="mb-2">⚠️ {error}</p>
              <p className="text-sm">Please check your API key configuration</p>
            </div>
          </div>
        )}
        
        {!isLoading && !error && apiKey && (
          <div className="relative w-full h-full">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={mapUrl}
              className="w-full h-full"
              title={`Map showing ${location}`}
              onError={() => setError('Maps Embed API not enabled')}
            />
            
            {/* Fallback link if iframe fails */}
            <div className="absolute bottom-2 right-2">
              <a
                href={fallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors shadow-lg"
              >
                Open in Maps
              </a>
            </div>
          </div>
        )}
        
        {/* Alternative: Show a simple map link if API key issues persist */}
        {!isLoading && error && (
          <div className="h-full w-full flex flex-col items-center justify-center p-6">
            <div className="text-center text-gray-600 mb-4">
              <p className="mb-2">⚠️ {error}</p>
              <p className="text-sm">Unable to load embedded map</p>
            </div>
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              View on Google Maps
            </a>
          </div>
        )}
      </div>
    </div>
  );
}