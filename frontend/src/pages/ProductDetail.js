import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, Package, Layers, Palette, Tag, Box } from 'lucide-react';
import axios from 'axios';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error.message);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
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

  const price = Number(product.price).toLocaleString('vi-VN');
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
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--secondary)', marginBottom: '25px' }}>
              {price} ₫
            </p>

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
      </div>
    </div>
  );
};

export default ProductDetail;
