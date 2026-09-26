import React, { useState, useEffect } from 'react';
const Carousel = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  if (images.length === 0) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg bg-gray-200 animate-pulse">
        <div className="w-full h-full bg-gray-300"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg group">
      <div 
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((item, idx) => (
          <div key={item.id || idx} className="min-w-full h-full flex-shrink-0">
            <img src={`http://localhost:8000/storage/${item.image_path}`} alt={`Slide ${idx + 1}`} className="object-cover w-full h-full" />
          </div>
        ))}
      </div>

      <button 
        onClick={handlePrev}
        type="button"
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <i className="fas fa-chevron-left"></i>
      </button>

      <button 
        onClick={handleNext}
        type="button"
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <i className="fas fa-chevron-right"></i>
      </button>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <button 
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`w-3 h-3 rounded-full transition-opacity ${
              currentIndex === idx ? 'bg-white opacity-100' : 'bg-white opacity-50 hover:opacity-100'
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
