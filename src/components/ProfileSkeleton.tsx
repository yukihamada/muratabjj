import React from 'react'

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bjj-dark to-bjj-darker">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 bg-gray-700 animate-pulse h-10 w-48 rounded"></h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Info Skeleton */}
          <div className="md:col-span-2">
            <div className="card-gradient border border-white/10 rounded-bjj p-6">
              <h2 className="text-xl font-semibold mb-4 bg-gray-700 animate-pulse h-7 w-32 rounded"></h2>
              
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <div className="bg-gray-700 animate-pulse h-5 w-20 rounded mb-2"></div>
                  <div className="bg-gray-800 animate-pulse h-10 w-full rounded"></div>
                </div>

                {/* Belt */}
                <div>
                  <div className="bg-gray-700 animate-pulse h-5 w-16 rounded mb-2"></div>
                  <div className="bg-gray-800 animate-pulse h-10 w-full rounded"></div>
                </div>

                {/* Stripes */}
                <div>
                  <div className="bg-gray-700 animate-pulse h-5 w-24 rounded mb-2"></div>
                  <div className="bg-gray-800 animate-pulse h-10 w-full rounded"></div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <div className="bg-gray-700 animate-pulse h-10 w-24 rounded"></div>
                  <div className="bg-gray-700 animate-pulse h-10 w-24 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="space-y-4">
            {/* Profile Photo */}
            <div className="card-gradient border border-white/10 rounded-bjj p-6 text-center">
              <div className="w-32 h-32 bg-gray-700 animate-pulse rounded-full mx-auto mb-4"></div>
              <div className="bg-gray-700 animate-pulse h-5 w-32 mx-auto rounded mb-2"></div>
              <div className="bg-gray-700 animate-pulse h-4 w-24 mx-auto rounded"></div>
            </div>

            {/* Stats Card */}
            <div className="card-gradient border border-white/10 rounded-bjj p-6">
              <h3 className="text-lg font-semibold mb-4 bg-gray-700 animate-pulse h-6 w-24 rounded"></h3>
              
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="bg-gray-700 animate-pulse h-4 w-32 rounded"></div>
                    <div className="bg-gray-700 animate-pulse h-4 w-12 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}