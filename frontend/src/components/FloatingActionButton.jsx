const FloatingActionButton = ({ onClick, icon = "+", label }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-40 group"
      aria-label={label}
    >
      <span className="text-3xl font-light group-hover:rotate-90 transition-transform duration-300">
        {icon}
      </span>

      {label && (
        <span className="absolute right-20 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          {label}
        </span>
      )}

      <style>{`
        .shadow-3xl {
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </button>
  );
};

export default FloatingActionButton;
