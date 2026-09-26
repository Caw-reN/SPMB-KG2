import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import BantuanModal from '../components/public/BantuanModal';

const PublicLayout = () => {
  const [bantuanOpen, setBantuanOpen] = useState(false);

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <PublicHeader onOpenBantuan={() => setBantuanOpen(true)} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <PublicFooter />
      <BantuanModal isOpen={bantuanOpen} onClose={() => setBantuanOpen(false)} />
    </div>
  );
};

export default PublicLayout;
