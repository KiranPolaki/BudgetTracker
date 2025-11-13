import { useEffect, useRef } from "react";
import { BrowserRouter } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import AppRouter from "./router";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";

function App() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const prevUserIdRef = useRef(null);

  useEffect(() => {
    if (user && user.id !== prevUserIdRef.current) {
      queryClient.invalidateQueries();
      prevUserIdRef.current = user.id;
    }
  }, [user, queryClient]);

  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster position="top-right" reverseOrder={false} />
    </BrowserRouter>
  );
}

export default App;
