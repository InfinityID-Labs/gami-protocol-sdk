import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={toggleSidebar} />
          <Sidebar className="fixed inset-y-0 left-0 z-40 w-64 flex flex-col" />
        </div>
      )}

      {/* Desktop sidebar */}
      <Sidebar className="hidden md:flex sidebar-nav" />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={toggleSidebar} />

        <main className={cn("flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6")}>
          {children}
        </main>
      </div>
    </div>
  );
}
