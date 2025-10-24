import { useEffect } from "react";
import useStore from "../store/useStore";

const Toast = () => {
  const { toasts, removeToast } = useStore();

  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration || 3000);

      return () => clearTimeout(timer);
    });
  }, [toasts, removeToast]);

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "ℹ";
    }
  };

  const getColors = (type) => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      case "warning":
        return "bg-orange-500 text-white";
      case "info":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-800 text-white";
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getColors(
            toast.type
          )} rounded-lg shadow-2xl p-4 min-w-[300px] max-w-md transform transition-all duration-300 ease-out animate-slideIn flex items-start gap-3`}
          style={{
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center font-bold">
            {getIcon(toast.type)}
          </div>
          <div className="flex-1">
            {toast.title && <p className="font-semibold mb-1">{toast.title}</p>}
            <p className="text-sm opacity-90">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-white opacity-70 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;
