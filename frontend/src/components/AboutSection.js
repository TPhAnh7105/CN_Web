import React from 'react';

const AboutSection = () => {
  return (
    <section id="about" className="container" style={{ padding: '100px 20px' }}>
      <div className="about-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
        <div className="about-image" style={{ position: 'relative' }}>
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop"
            alt="About LuxeFurnish"
            style={{ width: '100%', borderRadius: '24px', boxShadow: 'var(--shadow-md)' }}
          />
          <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', background: 'var(--secondary)', color: 'var(--white)', padding: '30px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '5px' }}>0</h3>
            <p style={{ fontWeight: '500' }}>Năm kinh nghiệm</p>
          </div>
        </div>
        <div className="about-text">
          <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '20px' }}>Kiến tạo không gian sống đẳng cấp</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '20px' }}>
            LuxeFurnish tự hào là thương hiệu tiên phong trong việc cung cấp các giải pháp nội thất sang trọng, hiện đại và tối giản. Mỗi sản phẩm của chúng tôi đều được tuyển chọn kỹ lưỡng từ các vật liệu cao cấp nhất, kết hợp với tay nghề thủ công điêu luyện.
          </p>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '30px' }}>
            Chúng tôi tin rằng ngôi nhà không chỉ là nơi để ở, mà còn là bản phản chiếu cá tính và phong cách sống của mỗi chủ nhân. Hãy để LuxeFurnish đồng hành cùng bạn trên hành trình kiến tạo tổ ấm.
          </p>
          <a href="#products" className="btn btn-primary">Tìm hiểu thêm về chúng tôi</a>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
