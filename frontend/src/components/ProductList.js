import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';

const ProductList = ({ products, loading, title = "Trending Now" }) => {
  return (
    <section id="products" className="container" style={{ padding: '80px 20px' }}>
      <h2 className="section-title">{title}</h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <h3>Loading premium collections...</h3>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <Link key={product.id} to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="product-card">
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <img src={product.image} alt={product.name} className="product-img" />
                  {product.discountPercent && (
                    <div style={{ position: 'absolute', top: '15px', left: '15px', background: '#e74c3c', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700', boxShadow: 'var(--shadow-sm)' }}>
                      -{product.discountPercent}%
                    </div>
                  )}
                  <button 
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'white', border: 'none', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                    onClick={(e) => e.preventDefault()}
                  >
                    <Heart size={18} color="var(--text-muted)" />
                  </button>
                </div>
                <div className="product-info">
                  <div className="product-category">{product.category}</div>
                  <h3 className="product-title">{product.name}</h3>
                  {/* Tạm ẩn đánh giá sao */}
                  <div className="product-footer">
                    <div>
                      {product.originalPrice && (
                        <div style={{ textDecoration: 'line-through', fontSize: '0.8rem', color: '#e74c3c', marginBottom: '2px' }}>
                          {product.originalPrice} ₫
                        </div>
                      )}
                      <div className="product-price">{product.price} ₫</div>
                    </div>
                    <span className="add-to-cart">
                      Xem chi tiết <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductList;
