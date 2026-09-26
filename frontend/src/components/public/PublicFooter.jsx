import React from 'react';

const PublicFooter = () => {
  const startYear = 2025;
  const currentYear = new Date().getFullYear();
  const yearDisplay = currentYear > startYear ? `${startYear} - ${currentYear}` : startYear;

  return (
    <footer className="text-center py-6 mt-auto text-gray-500 text-sm border-t border-gray-200 bg-gray-50/50">
      <p className="font-medium">
        &copy; {yearDisplay} <span className="text-kg-green font-bold">SMK Karya Guna 2 Bekasi</span>. All Rights Reserved.
      </p>
    </footer>
  );
};

export default PublicFooter;
