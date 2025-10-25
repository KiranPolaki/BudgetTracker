import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />
      <main className="mt-12 overflow-hidden -mb-14 ">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
