'use client';

import { Calendar } from 'lucide-react';
import Link from 'next/link';


export default function Hero() {


  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[calc(100vh-4rem)] flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">
              <div className="leading-none">Bring people</div>
              <div className="leading-none mt-2">together</div>
              <div className="text-blue-600 mt-2">with Eventify</div>
            </h1>
            
            <p className="mt-6 text-xl text-gray-600 max-w-2xl">
              The all-in-one platform for events that matter
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="#events" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition-colors text-center">
                Find Events
              </Link>
              <Link href="/events/create" className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-full font-medium transition-colors text-center">
                Create Event
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8 text-center lg:text-left">
              <div>
                <div className="text-2xl font-bold text-gray-900">50K+</div>
                <div className="text-sm text-gray-600">Events Created</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">1M+</div>
                <div className="text-sm text-gray-600">Happy Attendees</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">100+</div>
                <div className="text-sm text-gray-600">Cities Worldwide</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
                {/* Placeholder for hero image */}
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 text-white text-center p-8">
                  <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-medium">Join thousands of events happening right now</p>
                </div>
              </div>
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 border">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">✓</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Event Created!</div>
                  <div className="text-sm text-gray-600">Ready to go live</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
