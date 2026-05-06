import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Categories = () => {
  const categoriesData = [
    {
      id: 1,
      name: 'Phòng khách',
      description: 'Trung tâm của ngôi nhà, nơi thể hiện trọn vẹn gu thẩm mỹ và phong cách sống của bạn. Khám phá các bộ sưu tập sofa da cao cấp, bàn trà tinh tế và kệ tivi nguyên khối mang lại không gian sang trọng.',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200',
      count: '8 Sản phẩm'
    },
    {
      id: 2,
      name: 'Phòng ngủ',
      description: 'Không gian riêng tư tuyệt đối giúp bạn nạp lại năng lượng sau một ngày dài. Tuyển tập các mẫu giường ngủ êm ái, tủ quần áo thông minh và bàn trang điểm thanh lịch thiết kế chuẩn Bắc Âu.',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200',
      count: '8 Sản phẩm'
    },
    {
      id: 3,
      name: 'Phòng ăn & Bếp',
      description: 'Nơi giữ lửa hạnh phúc gia đình qua từng bữa ăn ấm cúng. Trải nghiệm những bộ bàn ăn gỗ sồi tự nhiên, ghế bar sang trọng và đảo bếp đa năng hiện đại nhất.',
      image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=1200',
      count: '7 Sản phẩm'
    },
    {
      id: 4,
      name: 'Phòng làm việc',
      description: 'Khơi nguồn cảm hứng sáng tạo và tối ưu hóa hiệu suất với các mẫu bàn ghế công thái học, kệ sách thông minh thiết kế riêng cho không gian làm việc tại nhà.',
      image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=1200',
      count: '8 Sản phẩm'
    },
    {
      id: 5,
      name: 'Ngoài trời',
      description: 'Hòa mình vào thiên nhiên và tận hưởng bầu không khí trong lành cùng bộ sưu tập nội thất ban công, sân vườn với chất liệu mây nhựa siêu bền chịu mọi thời tiết.',
      image: 'https://images.unsplash.com/photo-1596079890744-c1a0462d0975?auto=format&fit=crop&q=80&w=1200',
      count: '7 Sản phẩm'
    }
  ];

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--white)' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '15px' }}>Danh Mục Không Gian</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Tuyển chọn những giải pháp nội thất hoàn hảo nhất, được thiết kế riêng biệt để phù hợp với từng không gian sống trong ngôi nhà của bạn.
        </p>
      </div>

      {/* Categories Detailed List */}
      <div className="container" style={{ padding: '60px 20px' }}>
        {categoriesData.map((cat, index) => (
          <div 
            key={cat.id}
            style={{ 
              display: 'grid', 
              gridTemplateColumns: index % 2 === 0 ? '1.2fr 1fr' : '1fr 1.2fr', 
              gap: '50px', 
              alignItems: 'center',
              marginBottom: '80px'
            }}
          >
            {/* Image (reorder for zig-zag layout) */}
            <div style={{ order: index % 2 === 0 ? 1 : 2, position: 'relative', overflow: 'hidden', borderRadius: '24px', boxShadow: 'var(--shadow-md)' }}>
              <img 
                src={cat.image} 
                alt={cat.name} 
                style={{ width: '100%', height: '450px', objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }} 
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </div>

            {/* Content */}
            <div style={{ order: index % 2 === 0 ? 2 : 1, padding: '20px' }}>
              <span style={{ color: 'var(--secondary)', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>
                {cat.count}
              </span>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', margin: '15px 0 20px' }}>{cat.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '30px' }}>
                {cat.description}
              </p>
              <Link 
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="btn btn-primary" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px' }}
              >
                Khám phá {cat.name} <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
