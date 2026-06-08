import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, ChevronDown, ChevronUp, Package, Layers, Palette, Tag, Box, Star, User, Image, Edit, FileText } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'desc' | 'image' | 'pdf'
  const [modalData, setModalData] = useState({ desc: '', imageUrl: '', imgAlt: '', pdfUrl: '', pdfTitle: '' });
  const [uploading, setUploading] = useState(false);

  const handlePdfFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Vui lòng chọn file định dạng PDF!');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    setUploading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/upload/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.data.success) {
        setModalData(prev => ({
          ...prev,
          pdfUrl: res.data.url,
          pdfTitle: prev.pdfTitle === 'Tài liệu đính kèm (PDF)' ? res.data.filename : prev.pdfTitle
        }));
        alert('Tải file PDF lên máy chủ thành công!');
      }
    } catch (err) {
      alert('Lỗi tải file lên: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleModalSubmit = async () => {
    let updatedDesc = product.detailedDescription || '';
    
    if (modalType === 'desc') {
      updatedDesc = modalData.desc;
    } else if (modalType === 'image') {
      if (!modalData.imageUrl.trim()) {
        alert('Vui lòng nhập URL hình ảnh');
        return;
      }
      const imgHtml = `<img src="${modalData.imageUrl.trim()}" style="max-width:100%; display:block; margin: 15px auto; border-radius: 8px;" alt="${modalData.imgAlt.trim() || 'Hình ảnh mô tả'}" />`;
      updatedDesc = updatedDesc + '\n' + imgHtml;
    } else if (modalType === 'pdf') {
      if (!modalData.pdfUrl.trim()) {
        alert('Vui lòng nhập URL tài liệu PDF');
        return;
      }
      const pdfUrl = modalData.pdfUrl.trim();
      const pdfTitle = modalData.pdfTitle.trim() || 'Tài liệu PDF đính kèm';
      const pdfHtml = `<div style="margin: 25px 0; padding: 15px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
    <h4 style="margin: 0; color: #0f172a; display: flex; align-items: center; gap: 8px; font-size: 1.05rem;">
      <span style="color: #e11d48; font-size: 1.2rem;">📄</span> ${pdfTitle}
    </h4>
    <a href="${pdfUrl}" target="_blank" rel="noopener noreferrer" style="padding: 6px 12px; background: var(--primary); color: white; text-decoration: none; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">Mở tab mới</a>
  </div>
  <iframe src="${pdfUrl}#toolbar=0&navpanes=0" width="100%" height="600px" style="border: 1px solid #cbd5e1; border-radius: 8px;" title="${pdfTitle}">
    Trình duyệt của bạn không hỗ trợ xem PDF trực tiếp. <a href="${pdfUrl}" target="_blank">Nhấn vào đây để tải về</a>.
  </iframe>
</div>`;
      updatedDesc = updatedDesc + '\n' + pdfHtml;
    }
    
    try {
      const res = await axios.put(`http://localhost:5000/api/products/${product.id}`, 
        { ...product, detailedDescription: updatedDesc }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProduct(res.data);
      setEditModalOpen(false);
      alert('Đã cập nhật mô tả chi tiết sản phẩm thành công!');
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        const fetchedProduct = response.data;
        setProduct(fetchedProduct);
        if (fetchedProduct.colors) setSelectedColor(fetchedProduct.colors.split(',')[0].trim());
        if (fetchedProduct.sizes) setSelectedSize(fetchedProduct.sizes.split(',')[0].trim());
        
        // Fetch related products (same type or same category)
        try {
          const resAll = await axios.get('http://localhost:5000/api/products');
          const filtered = resAll.data.filter(p => 
            (p.categoryId === fetchedProduct.categoryId || p.type === fetchedProduct.type) && String(p.id) !== String(id)
          );
          // Shuffle array randomly and take 4
          const related = filtered.sort(() => 0.5 - Math.random()).slice(0, 4);
          setRelatedProducts(related);
        } catch (e) { console.log(e); }

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
      setReviewMsg(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleAddToCart = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    addToCart({ ...product, selectedColor, selectedSize });
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

            {/* Options */}
            {(product.sizes || product.colors) && (
              <div style={{ marginBottom: '25px', display: 'flex', gap: '30px' }}>
                {product.sizes && (
                  <div>
                    <h4 style={{ marginBottom: '10px', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Kích cỡ</h4>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {product.sizes.split(',').map(s => s.trim()).filter(Boolean).map(size => (
                        <button 
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          style={{ padding: '8px 15px', border: selectedSize === size ? '2px solid var(--secondary)' : '1px solid #ddd', background: selectedSize === size ? 'var(--secondary)' : '#fff', color: selectedSize === size ? '#fff' : '#333', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: '0.2s' }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {product.colors && (
                  <div>
                    <h4 style={{ marginBottom: '10px', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Màu sắc</h4>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {product.colors.split(',').map(c => c.trim()).filter(Boolean).map(color => (
                        <button 
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          style={{ padding: '8px 15px', border: selectedColor === color ? '2px solid var(--secondary)' : '1px solid #ddd', background: selectedColor === color ? 'var(--secondary)' : '#fff', color: selectedColor === color ? '#fff' : '#333', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: '0.2s' }}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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

        {/* Detailed Description Section */}
        <div style={{ marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', margin: 0 }}>Chi tiết sản phẩm</h2>
            {user?.role === 'admin' && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => {
                    setModalType('desc');
                    setModalData({
                      desc: product.detailedDescription || '',
                      imageUrl: '',
                      imgAlt: '',
                      pdfUrl: '',
                      pdfTitle: 'Tài liệu đính kèm (PDF)'
                    });
                    setEditModalOpen(true);
                  }}
                  style={{ padding: '8px 15px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Edit size={16} /> Viết / Sửa mô tả
                </button>
                <button 
                  onClick={() => {
                    setModalType('image');
                    setModalData({
                      desc: '',
                      imageUrl: '',
                      imgAlt: '',
                      pdfUrl: '',
                      pdfTitle: 'Tài liệu đính kèm (PDF)'
                    });
                    setEditModalOpen(true);
                  }}
                  style={{ padding: '8px 15px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Image size={16} /> Chèn hình ảnh
                </button>
                <button 
                  onClick={() => {
                    setModalType('pdf');
                    setModalData({
                      desc: '',
                      imageUrl: '',
                      imgAlt: '',
                      pdfUrl: '',
                      pdfTitle: 'Tài liệu đính kèm (PDF)'
                    });
                    setEditModalOpen(true);
                  }}
                  style={{ padding: '8px 15px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <FileText size={16} /> Chèn PDF
                </button>
              </div>
            )}
          </div>
          
          {product.detailedDescription ? (
            <div style={{ 
              position: 'relative',
              overflow: 'hidden', 
              maxHeight: isDescExpanded ? '5000px' : '250px',
              transition: 'max-height 0.4s ease-in-out'
            }}>
              <div 
                style={{ lineHeight: '1.8', color: 'var(--text-light)', fontSize: '1.05rem', wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: product.detailedDescription.replace(/\n/g, '<br/>').replace(/<iframe\s+src="([^"]+?\.pdf)"/ig, '<iframe src="$1#toolbar=0&navpanes=0"') }}
              ></div>
              
              {!isDescExpanded && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, width: '100%', height: '120px',
                  background: 'linear-gradient(transparent, var(--bg-color))',
                  pointerEvents: 'none'
                }}></div>
              )}
            </div>
          ) : (
            <p style={{color: 'var(--text-muted)'}}>Sản phẩm này chưa có mô tả chi tiết.</p>
          )}
          
          {product.detailedDescription && (
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <button 
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                style={{
                  background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', 
                  padding: '8px 25px', borderRadius: '25px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
                  fontWeight: 600, transition: 'all 0.2s', outline: 'none'
                }}
              >
                {isDescExpanded ? (
                  <>Thu gọn <ChevronUp size={18}/></>
                ) : (
                  <>Xem toàn bộ mô tả chi tiết <ChevronDown size={18}/></>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div style={{ marginTop: '60px', borderTop: '1px solid #eee', paddingTop: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '30px' }}>Đánh giá của khách hàng</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {/* Review Form */}
            <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: 'var(--shadow-sm)', height: 'fit-content' }}>
              <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Viết đánh giá</h3>
              {reviewMsg && (
                <div style={{ 
                  padding: '10px', 
                  background: reviewMsg.includes('Cảm ơn') ? '#e8f6ec' : '#fdeded', 
                  color: reviewMsg.includes('Cảm ơn') ? '#27ae60' : '#e74c3c', 
                  borderRadius: '8px', 
                  marginBottom: '15px' 
                }}>
                  {reviewMsg}
                </div>
              )}
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

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '80px' }}>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '30px', textAlign: 'center' }}>Sản phẩm liên quan</h2>
            <div className="products-grid">
              {relatedProducts.map(p => (
                <div key={p.id} className="product-card">
                  {p.discountPrice && (
                    <div className="product-badge">Giảm {Math.round((1 - p.discountPrice / p.price) * 100)}%</div>
                  )}
                  <Link to={`/products/${p.id}`}>
                    <div style={{ position: 'relative', overflow: 'hidden', borderTopLeftRadius: '15px', borderTopRightRadius: '15px', height: '220px', backgroundColor: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={p.mainImage} alt={p.name} className="product-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentNode.style.alignItems = 'center'; e.target.parentNode.innerHTML = '<span style="color:#999;font-size:0.9rem;">Lỗi tải ảnh</span>'; }} />
                    </div>
                  </Link>
                  <div className="product-info">
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>{p.type}</div>
                    <Link to={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
                      <h3 className="product-name">{p.name}</h3>
                    </Link>
                    <div className="product-price">
                      {p.discountPrice ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9rem', marginRight: '10px' }}>{Number(p.price).toLocaleString()} ₫</span>
                          <span style={{ color: '#e74c3c' }}>{Number(p.discountPrice).toLocaleString()} ₫</span>
                        </>
                      ) : (
                        <span>{Number(p.price).toLocaleString()} ₫</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Edit Modal */}
        {editModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1100
          }}>
            <div style={{
              background: 'white', padding: '30px', borderRadius: '15px',
              width: '100%', maxWidth: '600px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              position: 'relative'
            }}>
              <h3 style={{ marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid #eee', paddingBottom: '10px', fontSize: '1.25rem', fontWeight: 'bold' }}>
                {modalType === 'desc' ? 'Chỉnh sửa mô tả chi tiết' : 
                 modalType === 'image' ? 'Chèn hình ảnh vào mô tả' : 'Chèn tài liệu PDF đính kèm'}
              </h3>
              
              {modalType === 'desc' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Nội dung mô tả (Hỗ trợ định dạng HTML)</label>
                  <textarea 
                    value={modalData.desc}
                    onChange={(e) => setModalData({ ...modalData, desc: e.target.value })}
                    style={{ width: '100%', height: '250px', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
                    placeholder="Nhập mô tả sản phẩm ở đây..."
                  />
                </div>
              )}

              {modalType === 'image' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Đường dẫn hình ảnh (URL)</label>
                    <input 
                      type="text"
                      value={modalData.imageUrl}
                      onChange={(e) => setModalData({ ...modalData, imageUrl: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', outline: 'none' }}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Tên mô tả hình ảnh (Alt text)</label>
                    <input 
                      type="text"
                      value={modalData.imgAlt}
                      onChange={(e) => setModalData({ ...modalData, imgAlt: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', outline: 'none' }}
                      placeholder="Hình ảnh Sofa"
                    />
                  </div>
                </div>
              )}

              {modalType === 'pdf' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Tải file PDF từ máy tính</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfFileChange}
                        style={{ display: 'none' }}
                        id="pdf-upload-input"
                      />
                      <label 
                        htmlFor="pdf-upload-input"
                        style={{
                          background: 'var(--primary)', color: 'white', padding: '10px 15px', borderRadius: '8px', 
                          cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, display: 'inline-block'
                        }}
                      >
                        {uploading ? 'Đang tải lên...' : 'Chọn file từ máy'}
                      </label>
                      {modalData.pdfUrl && (
                        <span style={{ fontSize: '0.85rem', color: '#27ae60', fontWeight: 'bold' }}>
                          ✓ {modalData.pdfTitle !== 'Tài liệu đính kèm (PDF)' ? modalData.pdfTitle : 'Đã tải file lên'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>HOẶC</span>
                    <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Đường dẫn file PDF (URL)</label>
                    <input 
                      type="text"
                      value={modalData.pdfUrl}
                      onChange={(e) => setModalData({ ...modalData, pdfUrl: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', outline: 'none' }}
                      placeholder="https://example.com/document.pdf"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Tên hiển thị tài liệu</label>
                    <input 
                      type="text"
                      value={modalData.pdfTitle}
                      onChange={(e) => setModalData({ ...modalData, pdfTitle: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', outline: 'none' }}
                      placeholder="Tài liệu đính kèm (PDF)"
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <button 
                  onClick={() => setEditModalOpen(false)}
                  style={{ background: '#eee', color: '#333', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleModalSubmit}
                  style={{ background: 'var(--secondary)', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  {modalType === 'desc' ? 'Lưu thay đổi' : 'Chèn nội dung'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetail;
