import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryList = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 1,
      name: 'Phòng khách',
      image: 'https://picsum.photos/seed/furn17/800/600',
      count: '3 sản phẩm'
    },
    {
      id: 2,
      name: 'Phòng ngủ',
      image: 'https://picsum.photos/seed/furn18/800/600',
      count: '3 sản phẩm'
    },
    {
      id: 3,
      name: 'Phòng ăn & Bếp',
      image: 'https://picsum.photos/seed/furn19/800/600',
      count: '2 sản phẩm'
    },
    {
      id: 4,
      name: 'Phòng làm việc',
      image: 'https://picsum.photos/seed/furn20/800/600',
      count: '2 sản phẩm'
    },
    {
      id: 5,
      name: 'Ngoài trời',
      image: 'https://picsum.photos/seed/furn21/800/600',
      count: '1 sản phẩm'
    }
  ];

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section id="categories" className="container" style={{ padding: '80px 20px' }}>
      <h2 className="section-title">Danh Mục Nổi Bật</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '-30px', marginBottom: '50px' }}>
        Khám phá không gian sống hoàn hảo theo từng nhu cầu riêng biệt
      </p>

      <div className="categories-grid">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className="category-card" 
            onClick={() => handleCategoryClick(cat.name)}
          >
            <div className="category-img-wrapper">
              <img src={cat.image} alt={cat.name} className="category-img" />
              <div className="category-overlay">
                <div className="category-info-text">
                  <h3>{cat.name}</h3>
                  <span>{cat.count}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryList;
