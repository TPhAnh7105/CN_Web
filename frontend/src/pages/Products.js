import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductList from '../components/ProductList';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedRoom, setSelectedRoom] = useState('Tất cả');
  const [selectedType, setSelectedType] = useState('Tất cả');
  const [selectedStyle, setSelectedStyle] = useState('Tất cả');
  const [selectedSegment, setSelectedSegment] = useState('Tất cả');

  const location = useLocation();
  const navigate = useNavigate();

  // Filter options
  const rooms = ['Tất cả', 'Phòng khách', 'Phòng ngủ', 'Phòng ăn & Bếp', 'Phòng làm việc', 'Ngoài trời'];
  const types = ['Tất cả', 'Bàn gỗ', 'Ghế gỗ', 'Tủ', 'Giường', 'Đồ trang trí', 'Sofa'];
  const styles = ['Tất cả', 'Hiện đại', 'Cổ điển', 'Bắc Âu', 'Tối giản', 'Công nghiệp'];
  const segments = ['Tất cả', 'Bình dân', 'Trung lưu', 'Cao cấp'];

  useEffect(() => {
    // Read parameters from URL query
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    const typeParam = params.get('type');
    const styleParam = params.get('style');
    const segmentParam = params.get('segment');
    
    if (catParam && rooms.includes(catParam)) setSelectedRoom(catParam);
    if (typeParam && types.includes(typeParam)) setSelectedType(typeParam);
    if (styleParam && styles.includes(styleParam)) setSelectedStyle(styleParam);
    if (segmentParam && segments.includes(segmentParam)) setSelectedSegment(segmentParam);
    
  }, [location]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        if (response.data && response.data.length > 0) {
          const mappedProducts = response.data.map(p => ({
            id: p.id,
            name: p.name,
            price: Number(p.price).toLocaleString('vi-VN'),
            category: p.room || 'Nội thất', // use room as primary display category
            room: p.room,
            type: p.type,
            style: p.style,
            segment: p.segment,
            image: p.mainImage,
            rating: (4.2 + Math.random() * 0.8).toFixed(1)
          }));
          setProducts(mappedProducts);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('Error fetching products from API:', error.message);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;

    if (selectedRoom !== 'Tất cả') {
      result = result.filter(p => p.room === selectedRoom);
    }
    if (selectedType !== 'Tất cả') {
      result = result.filter(p => p.type === selectedType);
    }
    if (selectedStyle !== 'Tất cả') {
      result = result.filter(p => p.style === selectedStyle);
    }
    if (selectedSegment !== 'Tất cả') {
      result = result.filter(p => p.segment === selectedSegment);
    }

    setFilteredProducts(result);
  }, [selectedRoom, selectedType, selectedStyle, selectedSegment, products]);

  // Handle URL updates when filters change
  const updateUrl = (key, value) => {
    const params = new URLSearchParams(location.search);
    if (value === 'Tất cả') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    navigate(`/products?${params.toString()}`, { replace: true });
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '80vh' }}>
      <div className="container" style={{ padding: '40px 20px 0' }}>
        <h1 className="section-title" style={{ marginBottom: '30px' }}>Bộ Sưu Tập Sản Phẩm</h1>
        
        {/* Filter Controls */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'center', 
          flexWrap: 'wrap', 
          marginBottom: '40px',
          background: 'var(--white)',
          padding: '20px',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Segment Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Phân loại nội thất</label>
            <select 
              value={selectedSegment} 
              onChange={(e) => { setSelectedSegment(e.target.value); updateUrl('segment', e.target.value); }}
              style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', minWidth: '150px', outline: 'none' }}
            >
              {segments.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Style Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Phong cách</label>
            <select 
              value={selectedStyle} 
              onChange={(e) => { setSelectedStyle(e.target.value); updateUrl('style', e.target.value); }}
              style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', minWidth: '150px', outline: 'none' }}
            >
              {styles.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Room Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Không gian</label>
            <select 
              value={selectedRoom} 
              onChange={(e) => { setSelectedRoom(e.target.value); updateUrl('category', e.target.value); }}
              style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', minWidth: '150px', outline: 'none' }}
            >
              {rooms.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Type Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Loại nội thất</label>
            <select 
              value={selectedType} 
              onChange={(e) => { setSelectedType(e.target.value); updateUrl('type', e.target.value); }}
              style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', minWidth: '150px', outline: 'none' }}
            >
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-muted)' }}>
          Hiển thị {filteredProducts.length} sản phẩm
        </div>
      </div>

      <ProductList products={filteredProducts} loading={loading} title="" />
    </div>
  );
};

export default Products;
