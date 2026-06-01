import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeroSlider from '../components/HeroSlider';
import CategoryList from '../components/CategoryList';
import ProductList from '../components/ProductList';
import AboutSection from '../components/AboutSection';
import { Star } from 'lucide-react';

const mockReviews = [
  { id: 'm1', rating: 5, comment: "Sofa rất đẹp, thiết kế hiện đại. Giao hàng cực kỳ cẩn thận và nhanh chóng.", User: { username: "Minh Tuấn" }, Product: { name: "Sô-pha xám phong cách hiện đại" } },
  { id: 'm2', rating: 5, comment: "Bàn ăn chắc chắn, màu gỗ tự nhiên lên vân rất sang trọng. Gia đình tôi rất ưng ý.", User: { username: "Hải Yến" }, Product: { name: "Bàn ăn gỗ sồi nguyên khối" } },
  { id: 'm3', rating: 4, comment: "Chất lượng hoàn thiện tốt, đệm ngồi êm ái. Rất đáng tiền trong phân khúc này.", User: { username: "Đức Trí" }, Product: { name: "Ghế thư giãn phong cách tối giản" } }
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentReviews, setRecentReviews] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        if (response.data && response.data.length > 0) {
          const mappedProducts = response.data.map(p => ({
            id: p.id,
            name: p.name,
            price: p.discountPrice ? Number(p.discountPrice).toLocaleString('vi-VN') : Number(p.price).toLocaleString('vi-VN'),
            originalPrice: p.discountPrice ? Number(p.price).toLocaleString('vi-VN') : null,
            discountPercent: p.discountPrice ? Math.round((1 - p.discountPrice / p.price) * 100) : null,
            category: p.room || 'Nội thất', // changed from Category object
            room: p.room,
            type: p.type,
            image: p.mainImage,
            rating: (4.2 + Math.random() * 0.8).toFixed(1)
          }));
          setProducts(mappedProducts);
          
          try {
            const resReviews = await axios.get('http://localhost:5000/api/reviews/recent');
            if (resReviews.data && resReviews.data.length > 0) {
              setRecentReviews(resReviews.data);
            } else {
              setRecentReviews(mockReviews);
            }
          } catch (e) {
            console.log('Error fetching reviews');
            setRecentReviews(mockReviews);
          }
          
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('Using mock data because API is not available:', error.message);
      }

      // Fallback to mock data
      setRecentReviews(mockReviews);
      setProducts([
        { id: 1, name: 'Sô-pha xám phong cách hiện đại', price: "25.000.000", category: 'Phòng khách', image: 'https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?auto=format&fit=crop&w=800&q=80', rating: 4.8 },
        { id: 2, name: 'Bàn ăn gỗ sồi nguyên khối', price: "18.500.000", category: 'Phòng ăn & Bếp', image: 'https://images.unsplash.com/photo-1530629013299-6cb10d168419?auto=format&fit=crop&w=800&q=80', rating: 4.9 },
        { id: 3, name: 'Ghế thư giãn phong cách tối giản', price: "5.500.000", category: 'Ngoài trời', image: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=800&q=80', rating: 4.5 },
        { id: 4, name: 'Tủ Quần Áo Cánh Kính', price: "28.000.000", category: 'Phòng ngủ', image: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=800&q=80', rating: 4.7 },
        { id: 5, name: 'Bàn Trà Mặt Đá Khung Inox', price: "8.500.000", category: 'Phòng khách', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80', rating: 4.6 },
        { id: 6, name: 'Tủ Bếp Acrylic Bóng Gương', price: "45.000.000", category: 'Phòng ăn & Bếp', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80', rating: 4.9 },
        { id: 7, name: 'Ghế Công Thái Học Ergonomic', price: "6.800.000", category: 'Phòng làm việc', image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=800&q=80', rating: 4.8 },
        { id: 8, name: 'Bàn Làm Việc Chân Sắt Chữ K', price: "1.800.000", category: 'Phòng làm việc', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', rating: 4.4 }
      ]);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Filter products for different sections
  const bestSellingProducts = products.slice(0, 4); // Lấy 4 sản phẩm đầu làm bán chạy
  const livingRoomProducts = products.filter(p => p.category === 'Phòng khách').slice(0, 4);
  const diningRoomProducts = products.filter(p => p.category === 'Phòng ăn & Bếp').slice(0, 4);
  const discountedProducts = products.filter(p => p.originalPrice);

  return (
    <>
      {/* 1. Phần ảnh slide xuống dưới cùng */}
      <HeroSlider />
      
      {/* 2. Tổng danh mục */}
      <CategoryList />
      
      {/* Khuyến mãi */}
      {discountedProducts.length > 0 && (
        <ProductList title="Sản phẩm Đang Khuyến Mãi 🔥" products={discountedProducts} loading={loading} />
      )}
      
      {/* 3. Sản phẩm bán chạy */}
      <ProductList title="Sản phẩm bán chạy" products={bestSellingProducts} loading={loading} />
      
      {/* 4. Từng danh mục (2-3 mục) */}
      {livingRoomProducts.length > 0 && (
        <ProductList title="Không gian Phòng Khách" products={livingRoomProducts} loading={loading} />
      )}
      
      {diningRoomProducts.length > 0 && (
        <ProductList title="Phòng Ăn & Bếp Hiện Đại" products={diningRoomProducts} loading={loading} />
      )}
      
      {/* Khách hàng đánh giá */}
      {recentReviews.length > 0 && (
        <div style={{ backgroundColor: '#f9f9f9', padding: '60px 20px', margin: '40px 0' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', color: 'var(--primary)', fontSize: '2rem', marginBottom: '40px' }}>Khách Hàng Nói Gì Về Chúng Tôi</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              {recentReviews.map(review => (
                <div key={review.id} style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', gap: '2px', color: '#f1c40f', marginBottom: '15px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} fill={i < review.rating ? "currentColor" : "none"} color={i < review.rating ? "currentColor" : "#ddd"} />
                    ))}
                  </div>
                  <p style={{ color: 'var(--text-light)', lineHeight: '1.6', fontSize: '1.05rem', fontStyle: 'italic', marginBottom: '20px' }}>
                    "{review.comment}"
                  </p>
                  <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{review.User?.username || 'Khách hàng'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>{review.Product?.name || 'Sản phẩm'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* 5. Mục giới thiệu */}
      <AboutSection />
    </>
  );
};

export default Home;
