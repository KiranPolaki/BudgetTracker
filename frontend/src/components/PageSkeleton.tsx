import React from "react";

export default function PageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded"></div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="h-4 w-full bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
