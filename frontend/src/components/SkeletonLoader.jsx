export const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      </div>
      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
    </div>
  </div>
);

export const SkeletonTable = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <th key={i} className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i}>
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <td key={j} className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const SkeletonChart = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex flex-col items-center">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-8 animate-pulse"></div>
      <div className="w-64 h-64 bg-gray-200 rounded-full animate-pulse"></div>
    </div>
  </div>
);

export const SkeletonList = ({ rows = 3 }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100">
    <div className="p-6 border-b border-gray-100">
      <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
    </div>
    <div className="divide-y divide-gray-100">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="h-5 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
