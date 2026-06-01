import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Styles = () => {
  const stylesData = [
    {
      id: 1,
      name: 'Hiện đại',
      description: 'Phong cách tập trung vào công năng, đường nét dứt khoát và tối giản các chi tiết rườm rà. Thích hợp cho lối sống năng động, tươi mới.',
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      name: 'Tối giản',
      description: 'Nguyên tắc "Less is More". Tối giản không có nghĩa là trống rỗng, mà là giữ lại những tinh hoa mang lại sự bình yên cho tâm hồn.',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      name: 'Bắc Âu',
      description: 'Sự pha trộn tuyệt vời giữa vẻ đẹp, sự đơn giản và chức năng. Sử dụng gỗ sáng màu, ánh sáng tự nhiên và chất liệu thô mộc.',
      image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 4,
      name: 'Cổ điển',
      description: 'Tôn vinh vẻ đẹp vượt thời gian qua những chi tiết chạm khắc tỉ mỉ, đối xứng hoàn hảo và bảng màu trầm ấm sang trọng.',
      image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 5,
      name: 'Công nghiệp',
      description: 'Lấy cảm hứng từ những nhà máy cũ, mang nét cá tính mạnh mẽ với sự lộ diện của các yếu tố cấu trúc, kim loại thô và gạch trần.',
      image: 'https://images.unsplash.com/photo-1519961655809-34fa156820ff?auto=format&fit=crop&w=800&q=80',
    }
  ];

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--white)' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '15px' }}>Phong Cách Thiết Kế</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Mỗi phong cách là một câu chuyện riêng. Khám phá phong cách nào phản chiếu chân thực nhất cá tính của bạn.
        </p>
      </div>
      <div className="container" style={{ padding: '60px 20px' }}>
        {stylesData.map((style, index) => (
          <div key={style.id} style={{ display: 'grid', gridTemplateColumns: index % 2 === 0 ? '1.2fr 1fr' : '1fr 1.2fr', gap: '50px', alignItems: 'center', marginBottom: '80px' }}>
            <div style={{ order: index % 2 === 0 ? 1 : 2, position: 'relative', overflow: 'hidden', borderRadius: '24px', boxShadow: 'var(--shadow-md)' }}>
              <img src={style.image} alt={style.name} style={{ width: '100%', height: '450px', objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}/>
            </div>
            <div style={{ order: index % 2 === 0 ? 2 : 1, padding: '20px' }}>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', margin: '15px 0 20px' }}>{style.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '30px' }}>{style.description}</p>
              <Link to={`/products?style=${encodeURIComponent(style.name)}`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px' }}>Khám phá {style.name} <ArrowRight size={18} /></Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Styles;
