import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const PublicHeader = ({ onOpenBantuan }) => {
  const location = useLocation();
  const isCekStatus = location.pathname === '/cek-status';

  return (
    <header className="bg-white px-4">
      <div className="flex flex-col md:flex-row justify-between items-center py-4 mx-auto max-w-custom">
        <Link to="/" className="mb-3 md:mb-0">
          <img src="/assets/img/Logo.png" alt="Logo SPMB KG 2" className="max-w-[120px]" />
        </Link>
        
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex gap-4 text-kg-dark text-lg mb-3 md:mb-0">
            <a href="https://www.instagram.com/smkkaryaguna2bekasi" target="_blank" rel="noopener noreferrer" className="social-link transition-colors">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://www.facebook.com/smkkaryaguna2bekasi" target="_blank" rel="noopener noreferrer" className="social-link transition-colors">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://www.youtube.com/@smkkaryaguna2bekasi" target="_blank" rel="noopener noreferrer" className="social-link transition-colors">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="https://www.tiktok.com/@smkkaryaguna2bekasi" target="_blank" rel="noopener noreferrer" className="social-link transition-colors">
              <i className="fab fa-tiktok"></i>
            </a>
          </div>

          <div className="flex gap-3">
            {isCekStatus ? (
              <Link to="/" className="px-4 py-2 text-sm font-medium text-gray-800 border border-gray-800 rounded hover:bg-green-700 hover:border-green-700 hover:text-white transition-colors flex items-center">
                <i className="fas fa-user-plus mr-2"></i> Daftar Baru
              </Link>
            ) : (
              <Link to="/cek-status" className="px-4 py-2 text-sm font-medium text-gray-800 border border-gray-800 rounded hover:bg-green-700 hover:border-green-700 hover:text-white transition-colors flex items-center">
                <i className="fas fa-search mr-2"></i> Cek Pendaftaran
              </Link>
            )}

            <button 
              type="button" 
              onClick={onOpenBantuan} 
              className="px-4 py-2 text-sm font-medium text-green-700 border border-green-700 rounded hover:bg-green-700 hover:text-white transition-colors flex items-center"
            >
              <i className="fas fa-headset mr-2"></i> Bantuan
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
