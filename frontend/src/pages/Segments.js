import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Segments = () => {
  const segmentsData = [
    {
      id: 1,
      name: 'Bình dân',
      description: 'Những sản phẩm đề cao tính thực dụng, dễ dàng ứng dụng vào mọi không gian với mức chi phí vô cùng hợp lý cho mọi gia đình.',
      image: 'https://picsum.photos/seed/seg1/800/600',
    },
    {
      id: 2,
      name: 'Trung lưu',
      description: 'Sự cân bằng tuyệt vời giữa chất lượng vật liệu tốt, độ bền cao và thiết kế có gu, mang lại giá trị xứng đáng cho sự đầu tư của bạn.',
      image: 'https://picsum.photos/seed/seg2/800/600',
    },
    {
      id: 3,
      name: 'Cao cấp',
      description: 'Tác phẩm nghệ thuật đỉnh cao, sử dụng vật liệu thượng hạng nhất, chi tiết thủ công tinh xảo, khẳng định đẳng cấp và vị thế của gia chủ.',
      image: 'https://picsum.photos/seed/seg3/800/600',
    }
  ];

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--white)' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '15px' }}>Phân Cấp Sản Phẩm</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Được phân chia rõ ràng để giúp bạn dễ dàng lựa chọn sản phẩm phù hợp với ngân sách và mong muốn của gia đình.
        </p>
      </div>
      <div className="container" style={{ padding: '60px 20px' }}>
        {segmentsData.map((seg, index) => (
          <div key={seg.id} style={{ display: 'grid', gridTemplateColumns: index % 2 === 0 ? '1.2fr 1fr' : '1fr 1.2fr', gap: '50px', alignItems: 'center', marginBottom: '80px' }}>
            <div style={{ order: index % 2 === 0 ? 1 : 2, position: 'relative', overflow: 'hidden', borderRadius: '24px', boxShadow: 'var(--shadow-md)' }}>
              <img src={seg.image} alt={seg.name} style={{ width: '100%', height: '450px', objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}/>
            </div>
            <div style={{ order: index % 2 === 0 ? 2 : 1, padding: '20px' }}>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', margin: '15px 0 20px' }}>{seg.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '30px' }}>{seg.description}</p>
              <Link to={`/products?segment=${encodeURIComponent(seg.name)}`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px' }}>Khám phá {seg.name} <ArrowRight size={18} /></Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Segments;
