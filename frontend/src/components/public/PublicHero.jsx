import React, { useState, useEffect } from 'react';
import Carousel from './Carousel';
const PublicHero = ({ pengaturan, carousels = [] }) => {

  return (
    <section className="mx-auto my-8 md:my-12 px-4 max-w-custom w-full">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="w-full lg:w-1/2 text-center lg:text-left order-2 lg:order-1">
          <h2 className="text-3xl font-bold mb-1 leading-tight">{pengaturan.judul}</h2>
          <h3 className="text-2xl font-bold mb-4 text-gray-800">{pengaturan.nama_sekolah}</h3>
          <p className="text-lg text-gray-500 mb-6 leading-relaxed whitespace-pre-line">
            {pengaturan.deskripsi}
          </p>
        </div>

        <div className="w-full lg:w-1/2 p-2 order-1 lg:order-2">
          <Carousel images={carousels} />
        </div>
      </div>
    </section>
  );
};

export default PublicHero;
