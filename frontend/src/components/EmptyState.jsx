const EmptyState = ({ icon, title, message, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center mb-6 animate-bounce-slow">
        <span className="text-5xl">{icon}</span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center mb-6 max-w-md">{message}</p>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-smooth shadow-lg hover:shadow-xl"
        >
          {actionLabel}
        </button>
      )}

      <style>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default EmptyState;
