import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const navRef = useRef(null);
  const navigate = useNavigate();

  // Đóng dropdown khi click ra ngoài navbar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = (name) => {
    setOpenMenu(prev => (prev === name ? null : name));
  };

  const handleItemClick = (url) => {
    setOpenMenu(null);
    navigate(url);
  };

  const menus = [
    {
      label: 'Danh mục',
      key: 'danh-muc',
      items: [
        { label: 'Phòng khách', url: '/products?category=Phòng khách' },
        { label: 'Phòng ngủ', url: '/products?category=Phòng ngủ' },
        { label: 'Phòng ăn & Bếp', url: '/products?category=Phòng ăn & Bếp' },
        { label: 'Phòng làm việc', url: '/products?category=Phòng làm việc' },
        { label: 'Ngoài trời', url: '/products?category=Ngoài trời' },
      ]
    },
    {
      label: 'Phân loại',
      key: 'phan-loai',
      items: [
        { label: 'Bàn gỗ', url: '/products?type=Bàn gỗ' },
        { label: 'Ghế gỗ', url: '/products?type=Ghế gỗ' },
        { label: 'Tủ', url: '/products?type=Tủ' },
        { label: 'Giường', url: '/products?type=Giường' },
        { label: 'Sofa', url: '/products?type=Sofa' },
        { label: 'Đồ trang trí', url: '/products?type=Đồ trang trí' },
      ]
    },
    {
      label: 'Phong cách',
      key: 'phong-cach',
      items: [
        { label: 'Hiện đại', url: '/products?style=Hiện đại' },
        { label: 'Tối giản', url: '/products?style=Tối giản' },
        { label: 'Bắc Âu', url: '/products?style=Bắc Âu' },
        { label: 'Cổ điển', url: '/products?style=Cổ điển' },
        { label: 'Công nghiệp', url: '/products?style=Công nghiệp' },
      ]
    },
    {
      label: 'Phân cấp',
      key: 'phan-cap',
      items: [
        { label: 'Bình dân', url: '/products?segment=Bình dân' },
        { label: 'Trung lưu', url: '/products?segment=Trung lưu' },
        { label: 'Cao cấp', url: '/products?segment=Cao cấp' },
      ]
    },
  ];

  return (
    <nav className="navbar" ref={navRef}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 40px' }}>
        
        {/* Logo */}
        <Link to="/" className="logo" onClick={() => setOpenMenu(null)}>
          <span style={{ color: 'var(--secondary)' }}>Luxe</span>Furnish
        </Link>

        {/* Dropdown Menus */}
        <div className="nav-links">
          {menus.map(menu => (
            <div key={menu.key} className="nav-dropdown">
              <span
                className={`nav-dropbtn${openMenu === menu.key ? ' active' : ''}`}
                onClick={() => toggle(menu.key)}
              >
                {menu.label}
                <ChevronDown
                  size={15}
                  style={{
                    transition: 'transform 0.3s',
                    transform: openMenu === menu.key ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              </span>

              {openMenu === menu.key && (
                <div className="nav-dropdown-content">
                  {menu.items.map(item => (
                    <span
                      key={item.url}
                      className="nav-dropdown-item"
                      onClick={() => handleItemClick(item.url)}
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right: Icons + Login */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Search size={20} style={{ cursor: 'pointer', color: 'var(--white)' }} />
          <ShoppingCart size={20} style={{ cursor: 'pointer', color: 'var(--white)' }} />
          <a href="#" className="btn btn-secondary" style={{ padding: '8px 25px' }}>Đăng nhập</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
