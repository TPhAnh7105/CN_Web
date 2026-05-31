import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Types = () => {
  const typesData = [
    {
      id: 1,
      name: 'Bàn gỗ',
      description: 'Sự kết hợp hoàn hảo giữa nét đẹp tự nhiên của vân gỗ và thiết kế tinh tế. Phù hợp cho cả không gian ăn uống và làm việc.',
      image: 'https://picsum.photos/seed/type1/800/600',
    },
    {
      id: 2,
      name: 'Ghế gỗ',
      description: 'Cấu trúc vững chãi, ôm trọn vóc dáng mang lại sự thoải mái tuyệt đối cho những bữa ăn dài hay giờ phút thư giãn.',
      image: 'https://picsum.photos/seed/type2/800/600',
    },
    {
      id: 3,
      name: 'Tủ',
      description: 'Giải pháp lưu trữ thông minh với thiết kế tối giản, giúp tối ưu hóa không gian sống nhưng vẫn giữ được nét thanh lịch.',
      image: 'https://picsum.photos/seed/type3/800/600',
    },
    {
      id: 4,
      name: 'Giường',
      description: 'Trung tâm của sự thư giãn với thiết kế êm ái, mang đến cho bạn giấc ngủ trọn vẹn và nạp đầy năng lượng mỗi ngày.',
      image: 'https://picsum.photos/seed/type4/800/600',
    },
    {
      id: 5,
      name: 'Sofa',
      description: 'Điểm nhấn sang trọng của phòng khách. Chất liệu cao cấp và đệm bọc êm ái cho những khoảnh khắc quây quần.',
      image: 'https://picsum.photos/seed/type5/800/600',
    },
    {
      id: 6,
      name: 'Đồ trang trí',
      description: 'Những điểm xuyết nhỏ nhưng tinh tế, góp phần thể hiện cá tính riêng và làm cho không gian của bạn thêm phần nghệ thuật.',
      image: 'https://picsum.photos/seed/type6/800/600',
    }
  ];

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--white)' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '15px' }}>Phân Loại Nội Thất</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Đa dạng các mẫu mã và chủng loại sản phẩm, đáp ứng mọi nhu cầu sử dụng và sở thích của khách hàng.
        </p>
      </div>

      {/* Types Detailed List */}
      <div className="container" style={{ padding: '60px 20px' }}>
        {typesData.map((type, index) => (
          <div 
            key={type.id}
            style={{ 
              display: 'grid', 
              gridTemplateColumns: index % 2 === 0 ? '1.2fr 1fr' : '1fr 1.2fr', 
              gap: '50px', 
              alignItems: 'center',
              marginBottom: '80px'
            }}
          >
            {/* Image */}
            <div style={{ order: index % 2 === 0 ? 1 : 2, position: 'relative', overflow: 'hidden', borderRadius: '24px', boxShadow: 'var(--shadow-md)' }}>
              <img 
                src={type.image} 
                alt={type.name} 
                style={{ width: '100%', height: '450px', objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }} 
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </div>

            {/* Content */}
            <div style={{ order: index % 2 === 0 ? 2 : 1, padding: '20px' }}>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', margin: '15px 0 20px' }}>{type.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '30px' }}>
                {type.description}
              </p>
              <Link 
                to={`/products?type=${encodeURIComponent(type.name)}`}
                className="btn btn-primary" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px' }}
              >
                Khám phá {type.name} <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Types;
