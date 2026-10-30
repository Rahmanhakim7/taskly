import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      <div className="min-h-screen lg:pl-64">
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
