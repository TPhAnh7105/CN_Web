import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, ChevronDown, LogOut, User, Wallet, History, MapPin, Edit, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showLiveSearch, setShowLiveSearch] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navRef = useRef(null);
  const searchRef = useRef(null);
  const userDropdownRef = useRef(null);
  const navigate = useNavigate();

  const { cartCount } = useCart();
  const { isLoggedIn, logout, user } = useAuth();

  // Fetching real-time search results while typing
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const res = await axios.get('http://localhost:5000/api/products');
          const filtered = res.data.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.type && p.type.toLowerCase().includes(searchQuery.toLowerCase()))
          ).slice(0, 5); // top 5 only for preview
          setSearchResults(filtered);
          setShowLiveSearch(true);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSearchResults([]);
        setShowLiveSearch(false);
      }
    }, 300); // debounce duration

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Global click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowLiveSearch(false);
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) setShowUserDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowLiveSearch(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    navigate('/');
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

        {/* Main Dropdowns */}
        <div className="nav-links" style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          {menus.map(menu => (
            <div key={menu.key} className="nav-dropdown">
              <span
                className={`nav-dropbtn${openMenu === menu.key ? ' active' : ''}`}
                onClick={() => setOpenMenu(prev => (prev === menu.key ? null : menu.key))}
              >
                {menu.label}
                <ChevronDown size={15} style={{ transition: 'transform 0.3s', transform: openMenu === menu.key ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </span>
              {openMenu === menu.key && (
                <div className="nav-dropdown-content">
                  {menu.items.map(item => (
                    <span key={item.url} className="nav-dropdown-item" onClick={() => { setOpenMenu(null); navigate(item.url); }}>
                      {item.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Direct Quick Access Link ONLY for Admins */}
          {user?.role === 'admin' && (
            <Link to="/admin" style={{ textDecoration: 'none', fontWeight: 600, color: 'var(--secondary)', border: '1px solid var(--secondary)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.9rem', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '5px' }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--secondary)'; e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--secondary)'; }}
            >
              <Package size={15} /> QUẢN LÝ
            </Link>
          )}
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>

          {/* Live Search Bar */}
          <div ref={searchRef} className="live-search-container">
            <form onSubmit={handleSearchSubmit} className="nav-search-form">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => { if (searchResults.length > 0) setShowLiveSearch(true); }}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm sản phẩm..."
                className="nav-search-input"
              />
              <button type="submit" className="nav-search-btn"><Search size={18} /></button>
            </form>

            {showLiveSearch && searchResults.length > 0 && (
              <div className="live-search-results">
                {searchResults.map(item => (
                  <Link
                    key={item.id}
                    to={`/products/${item.id}`}
                    className="live-result-item"
                    onClick={() => { setShowLiveSearch(false); setSearchQuery(''); }}
                  >
                    <img src={item.mainImage} alt="" className="live-result-img" />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div className="live-result-name">{item.name}</div>
                      <div className="live-result-price">{Number(item.price).toLocaleString('vi-VN')} ₫</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Shopping Cart */}
          <Link to="/cart" style={{ position: 'relative', color: 'var(--white)', display: 'flex', alignItems: 'center' }}>
            <ShoppingCart size={22} style={{ cursor: 'pointer' }} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* Account / User dropdown */}
          {isLoggedIn ? (
            <div ref={userDropdownRef} className="user-dropdown">
              <div 
                style={{ cursor: 'pointer', color: 'var(--white)', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                onMouseOver={e => e.currentTarget.style.color = 'var(--secondary)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--white)'}
              >
                <User size={22} />
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user?.username || 'Thành viên'}</span>
                <ChevronDown size={14} />
              </div>

              {showUserDropdown && (
                <div className="user-dropdown-content">
                  <div className="user-dropdown-header">
                    <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{user?.username || 'Thành viên'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Chào mừng trở lại!</div>
                  </div>

                  {user?.role === 'admin' && (
                    <Link to="/admin" className="user-dropdown-item" style={{ background: '#f0f7ff', fontWeight: 600, color: '#0066cc' }} onClick={() => setShowUserDropdown(false)}>
                      <Package size={16} /> TRANG QUẢN LÝ
                    </Link>
                  )}

                  <Link to="/profile" className="user-dropdown-item" onClick={() => setShowUserDropdown(false)}>
                    <Edit size={16} /> Thông tin cá nhân
                  </Link>
                  <Link to="/wallet" className="user-dropdown-item" onClick={() => setShowUserDropdown(false)}>
                    <Wallet size={16} /> Số dư & Nạp tiền
                  </Link>
                  <Link to="/transactions" className="user-dropdown-item" onClick={() => setShowUserDropdown(false)}>
                    <History size={16} /> Lịch sử giao dịch
                  </Link>
                  <Link to="/address" className="user-dropdown-item" onClick={() => setShowUserDropdown(false)}>
                    <MapPin size={16} /> Địa chỉ giao hàng
                  </Link>

                  <div style={{ borderTop: '1px solid #eee', marginTop: '5px' }}>
                    <div className="user-dropdown-item" style={{ color: '#e74c3c' }} onClick={handleLogout}>
                      <LogOut size={16} /> Đăng xuất
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 25px' }}>Đăng nhập</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
