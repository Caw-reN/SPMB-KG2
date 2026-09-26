import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import { Menu } from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-gray-50 text-gray-800 font-sans h-screen flex overflow-hidden">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden relative w-full">
        {/* Mobile Header */}
        <div className="md:hidden bg-primary text-white p-4 flex justify-between items-center shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <img src="/assets/img/logo-w.png" alt="Logo" className="w-8 h-8 object-contain drop-shadow" />
            <h1 className="font-bold text-lg">Admin Panel</h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-1.5 hover:bg-green-800 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto flex flex-col relative w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
