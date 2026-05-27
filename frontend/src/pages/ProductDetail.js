import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, Package, Layers, Palette, Tag, Box, Star, User } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();
  const { token, user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error.message);
      }
      try {
        const resReviews = await axios.get(`http://localhost:5000/api/reviews/product/${id}`);
        setReviews(resReviews.data);
      } catch (error) {
        console.error('Error fetching reviews:', error.message);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      setReviewMsg('Vui lòng đăng nhập để đánh giá');
      return;
    }
    if (rating === 0) {
      setReviewMsg('Vui lòng chọn số sao đánh giá');
      return;
    }
    try {
      const res = await axios.post('http://localhost:5000/api/reviews', {
        productId: id,
        rating,
        comment
      }, { headers: { Authorization: `Bearer ${token}` } });

      setReviews([res.data.review, ...reviews]); // Giả lập update thêm user info sau
      setComment('');
      setRating(0);
      setReviewMsg('Cảm ơn bạn đã đánh giá!');
      setTimeout(() => setReviewMsg(''), 3000);

      // Refetch reviews
      const resReviews = await axios.get(`http://localhost:5000/api/reviews/product/${id}`);
      setReviews(resReviews.data);

    } catch (error) {
      setReviewMsg('Có lỗi xảy ra');
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '80vh' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '80vh' }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Sản phẩm không tồn tại</h2>
        <Link to="/products" className="btn btn-primary">Quay lại cửa hàng</Link>
      </div>
    );
  }

  const price = product.discountPrice ? Number(product.discountPrice).toLocaleString('vi-VN') : Number(product.price).toLocaleString('vi-VN');
  const originalPrice = product.discountPrice ? Number(product.price).toLocaleString('vi-VN') : null;
  const inStock = product.stock > 0;

  return (
    <div style={{ paddingTop: '90px', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <div className="container" style={{ padding: '40px 20px' }}>

        {/* Breadcrumb */}
        <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '30px', transition: 'color 0.3s' }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--secondary)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ChevronLeft size={18} /> Quay lại Bộ Sưu Tập
        </Link>

        {/* Main Content */}
        <div className="product-detail-grid">

          {/* Image */}
          <div className="product-detail-image-wrapper">
            <img
              src={product.mainImage}
              alt={product.name}
              className="product-detail-img"
            />
          </div>

          {/* Info */}
          <div className="product-detail-info">
            {/* Name */}
            <h1 style={{ fontSize: '2.2rem', color: 'var(--primary)', lineHeight: '1.3', marginBottom: '15px' }}>
              {product.name}
            </h1>

            {/* Price */}
            <div style={{ marginBottom: '25px' }}>
              {originalPrice && (
                <div style={{ textDecoration: 'line-through', fontSize: '1.2rem', color: '#e74c3c', marginBottom: '5px' }}>
                  {originalPrice} ₫
                </div>
              )}
              <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--secondary)' }}>
                {price} ₫
              </p>
            </div>

            {/* Tags */}
            <div className="product-detail-tags">
              {product.type && (
                <div className="detail-tag">
                  <Layers size={16} />
                  <span className="detail-tag-label">Loại</span>
                  <span className="detail-tag-value">{product.type}</span>
                </div>
              )}
              {product.segment && (
                <div className="detail-tag">
                  <Tag size={16} />
                  <span className="detail-tag-label">Phân cấp</span>
                  <span className="detail-tag-value">{product.segment}</span>
                </div>
              )}
              {product.style && (
                <div className="detail-tag">
                  <Palette size={16} />
                  <span className="detail-tag-label">Phong cách</span>
                  <span className="detail-tag-value">{product.style}</span>
                </div>
              )}
              {product.room && (
                <div className="detail-tag">
                  <Package size={16} />
                  <span className="detail-tag-label">Không gian</span>
                  <span className="detail-tag-value">{product.room}</span>
                </div>
              )}
              <div className="detail-tag">
                <Box size={16} />
                <span className="detail-tag-label">Còn lại</span>
                <span className="detail-tag-value" style={{ color: inStock ? '#27ae60' : '#e74c3c' }}>
                  {inStock ? `${product.stock} sản phẩm` : 'Hết hàng'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '35px' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '10px' }}>Mô tả sản phẩm</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1rem' }}>
                {product.description || 'Sản phẩm nội thất cao cấp, thiết kế tinh tế, chất liệu bền bỉ, mang lại vẻ đẹp và sự thoải mái cho không gian sống của bạn.'}
              </p>
            </div>

            {/* Add to cart */}
            <button
              className={`btn-add-to-cart ${addedToCart ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={!inStock}
              style={{ opacity: inStock ? 1 : 0.5, cursor: inStock ? 'pointer' : 'not-allowed' }}
            >
              <ShoppingCart size={20} />
              {addedToCart ? 'Đã thêm vào giỏ hàng ✓' : 'Thêm vào giỏ hàng'}
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ marginTop: '60px', borderTop: '1px solid #eee', paddingTop: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '30px' }}>Đánh giá của khách hàng</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {/* Review Form */}
            <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: 'var(--shadow-sm)', height: 'fit-content' }}>
              <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Viết đánh giá</h3>
              {reviewMsg && <div style={{ padding: '10px', background: '#e8f6ec', color: '#27ae60', borderRadius: '8px', marginBottom: '15px' }}>{reviewMsg}</div>}
              <form onSubmit={submitReview}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px' }}>Chất lượng dịch vụ</label>
                  <div style={{ display: 'flex', gap: '8px', padding: '5px 0' }}>
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const isLit = starValue <= (hoverRating || rating);
                      return (
                        <Star
                          key={starValue}
                          size={28}
                          style={{ cursor: 'pointer', transition: 'color 0.2s, transform 0.1s' }}
                          fill={isLit ? "#f1c40f" : "none"}
                          color={isLit ? "#f1c40f" : "#ccc"}
                          onClick={() => setRating(starValue)}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(0)}
                        />
                      );
                    })}
                  </div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px' }}>Nhận xét của bạn</label>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} required placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..." style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '100px', resize: 'vertical' }}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Gửi đánh giá</button>
              </form>
            </div>

            {/* Reviews List */}
            <div>
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {reviews.map(review => (
                    <div key={review.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #eee' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '40px', height: '40px', background: 'var(--secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <User size={20} />
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{review.User?.username || 'Khách'}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '2px', color: '#f1c40f' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} color={i < review.rating ? "currentColor" : "#ddd"} />
                          ))}
                        </div>
                      </div>
                      <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
