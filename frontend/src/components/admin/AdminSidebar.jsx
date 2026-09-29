import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Printer, Settings, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    navigate('/mlebu/login');
  };

  const navItems = [
    { to: '/mlebu/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/mlebu/data-pendaftar', icon: Users, label: 'Data Pendaftar' },
    { to: '/mlebu/cetak-kartu', icon: Printer, label: 'Cetak Kartu Ujian' },
    { to: '/mlebu/pengaturan', icon: Settings, label: 'Pengaturan' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-primary text-white flex-shrink-0 flex flex-col shadow-2xl md:shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="py-6 flex flex-col items-center justify-center border-b border-green-800 relative">
          <img 
            src="/assets/img/logo-w.png" 
            alt="Logo Sekolah" 
            className="w-40 h-40 object-contain drop-shadow-md transition-transform hover:scale-105"
          />
          <button 
            className="md:hidden absolute top-4 right-4 p-2 text-green-200 hover:text-white rounded-lg hover:bg-green-800 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

      <nav className="flex-1 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setIsOpen && setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 hover:bg-green-900 transition-colors ${
                isActive ? 'active-nav' : ''
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-green-800">
        <button
          onClick={handleLogout}
          type="button"
          className="flex items-center gap-2 text-sm text-green-200 hover:text-white w-full transition-colors justify-center"
        >
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
