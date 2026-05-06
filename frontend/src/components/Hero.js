import React from 'react';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container hero-content">
        <div className="hero-text">
          <h1>Thiết kế nội trúc của riêng bạn</h1>
          <p>

          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#products" className="btn btn-primary">Mua sắm ngay</a>
            <a href="#categories" className="btn btn-secondary">Khám Phá</a>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/modern_sofa.png" alt="Modern Sofa" />
          <div className="glass-card">

          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
