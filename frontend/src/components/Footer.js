import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: 'var(--primary)', color: 'var(--white)', paddingTop: '60px', marginTop: '60px' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', paddingBottom: '40px', padding: '0 20px 40px' }}>

        <div>
          <h3 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>
            <span style={{ color: 'var(--secondary)' }}>Luxe</span>Furnish
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '20px' }}>
            Đem lại phong cách sống hiện đại và sang trọng cho tổ ấm của bạn với bộ sưu tập nội thất tuyển chọn.
          </p>
        </div>

        <div>
          <h4 style={{ marginBottom: '20px', color: 'var(--secondary)' }}>Liên kết nhanh</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '10px' }}>
            <li><Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Trang chủ</Link></li>
            <li><Link to="/products" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Sản phẩm</Link></li>
            <li><Link to="/categories" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Danh mục</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ marginBottom: '20px', color: 'var(--secondary)' }}>Liên hệ</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '15px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
            <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <MapPin size={16} color="var(--secondary)" /> Nhân Hòa, Mỹ Hào, Hưng Yên
            </li>
            <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Phone size={16} color="var(--secondary)" /> +84 123 456 789
            </li>
            <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Mail size={16} color="var(--secondary)" /> contactme@luxefurnish.vn
            </li>
          </ul>
        </div>
      </div>
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        background: 'rgba(26, 37, 48, 0.95)', 
        backdropFilter: 'blur(10px)', 
        borderTop: '1px solid rgba(255,255,255,0.1)', 
        padding: '10px 0', 
        textAlign: 'center', 
        fontSize: '0.9rem', 
        color: '#fff', 
        fontWeight: 500,
        zIndex: 2000,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.2)'
      }}>
        © {new Date().getFullYear()} <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>Luxe</span>Furnish. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
