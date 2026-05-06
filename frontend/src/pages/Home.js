import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeroSlider from '../components/HeroSlider';
import CategoryList from '../components/CategoryList';
import ProductList from '../components/ProductList';
import AboutSection from '../components/AboutSection';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        if (response.data && response.data.length > 0) {
          const mappedProducts = response.data.map(p => ({
            id: p.id,
            name: p.name,
            price: Number(p.price).toLocaleString('vi-VN'),
            category: p.room || 'Nội thất', // changed from Category object
            room: p.room,
            type: p.type,
            image: p.mainImage,
            rating: (4.2 + Math.random() * 0.8).toFixed(1)
          }));
          setProducts(mappedProducts);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('Using mock data because API is not available:', error.message);
      }

      // Fallback to mock data
      setProducts([
        { id: 1, name: 'Sô-pha xám phong cách hiện đại', price: "25.000.000", category: 'Phòng khách', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800', rating: 4.8 },
        { id: 2, name: 'Bàn ăn gỗ sồi nguyên khối', price: "18.500.000", category: 'Phòng ăn & Bếp', image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?q=80&w=800', rating: 4.9 },
        { id: 3, name: 'Ghế thư giãn phong cách tối giản', price: "5.500.000", category: 'Ngoài trời', image: 'https://images.unsplash.com/photo-1596079890744-c1a0462d0975?q=80&w=800', rating: 4.5 },
        { id: 4, name: 'Tủ Quần Áo Cánh Kính', price: "28.000.000", category: 'Phòng ngủ', image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800', rating: 4.7 },
        { id: 5, name: 'Bàn Trà Mặt Đá Khung Inox', price: "8.500.000", category: 'Phòng khách', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=800', rating: 4.6 },
        { id: 6, name: 'Tủ Bếp Acrylic Bóng Gương', price: "45.000.000", category: 'Phòng ăn & Bếp', image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=800', rating: 4.9 },
        { id: 7, name: 'Ghế Công Thái Học Ergonomic', price: "6.800.000", category: 'Phòng làm việc', image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=800', rating: 4.8 },
        { id: 8, name: 'Bàn Làm Việc Chân Sắt Chữ K', price: "1.800.000", category: 'Phòng làm việc', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800', rating: 4.4 }
      ]);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Filter products for different sections
  const bestSellingProducts = products.slice(0, 4); // Lấy 4 sản phẩm đầu làm bán chạy
  const livingRoomProducts = products.filter(p => p.category === 'Phòng khách').slice(0, 4);
  const diningRoomProducts = products.filter(p => p.category === 'Phòng ăn & Bếp').slice(0, 4);

  return (
    <>
      {/* 1. Phần ảnh slide xuống dưới cùng */}
      <HeroSlider />
      
      {/* 2. Tổng danh mục */}
      <CategoryList />
      
      {/* 3. Sản phẩm bán chạy */}
      <ProductList title="Sản phẩm bán chạy" products={bestSellingProducts} loading={loading} />
      
      {/* 4. Từng danh mục (2-3 mục) */}
      {livingRoomProducts.length > 0 && (
        <ProductList title="Không gian Phòng Khách" products={livingRoomProducts} loading={loading} />
      )}
      
      {diningRoomProducts.length > 0 && (
        <ProductList title="Phòng Ăn & Bếp Hiện Đại" products={diningRoomProducts} loading={loading} />
      )}
      
      {/* 5. Mục giới thiệu */}
      <AboutSection />
    </>
  );
};

export default Home;
