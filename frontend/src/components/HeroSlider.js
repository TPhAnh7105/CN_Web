import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    image: 'https://picsum.photos/seed/furn14/800/600',
    title: 'Thiết kế nội thất vượt thời gian',
    subtitle: 'Nâng tầm không gian sống của bạn với các bộ sưu tập cao cấp'
  },
  {
    id: 2,
    image: 'https://picsum.photos/seed/furn15/800/600',
    title: 'Không gian phòng khách tinh tế',
    subtitle: 'Sự kết hợp hoàn hảo giữa thẩm mỹ và công năng'
  },
  {
    id: 3,
    image: 'https://picsum.photos/seed/furn16/800/600',
    title: 'Nghệ thuật sắp đặt đương đại',
    subtitle: 'Khám phá bộ sưu tập phong cách tối giản sang trọng'
  }
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
  };

  const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
  };

  return (
    <div className="hero-slider">
      <div 
        className="slider-container"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="slide">
            <img src={slide.image} alt={slide.title} />
            <div className="slide-overlay">
              <div className="container">
                <div className="slide-content">
                  <h1>{slide.title}</h1>
                  <p>{slide.subtitle}</p>
                  <button className="btn btn-primary" style={{ marginTop: '20px' }}>Khám phá ngay</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="slider-btn prev" onClick={prevSlide}>
        <ChevronLeft size={24} />
      </button>
      <button className="slider-btn next" onClick={nextSlide}>
        <ChevronRight size={24} />
      </button>
      
      <div className="slider-dots">
        {slides.map((_, index) => (
          <div 
            key={index} 
            className={`dot ${currentSlide === index ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
