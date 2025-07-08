export default function ExploreHero() {
  return (
    <section className="relative bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 py-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-4 h-4 bg-purple-400 rounded-full"></div>
        <div className="absolute top-20 right-20 w-6 h-6 bg-blue-400 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-5 h-5 bg-indigo-400 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-3 h-3 bg-pink-400 rounded-full"></div>
        <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-blue-300 rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-purple-300 rounded-full"></div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          <span className="text-blue-600">Explore</span> Events
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover amazing events happening around you and connect with
          like-minded people
        </p>
      </div>
    </section>
  );
}
