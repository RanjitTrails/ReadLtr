import React, { ReactNode } from "react";
import Sidebar from "./Sidebar";
import OfflineIndicator from "./OfflineIndicator";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-screen bg-black">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 bg-zinc-950 article-container relative">
        <div className="fixed top-4 right-4 z-50">
          <OfflineIndicator />
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;