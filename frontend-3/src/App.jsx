import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster position="top-right" reverseOrder={false} />
    </BrowserRouter>
  );
}

export default App;
