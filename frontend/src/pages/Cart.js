import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [checkoutStatus, setCheckoutStatus] = useState(null); // null | 'processing' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const triggerCheckout = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setIsModalOpen(true); // Open elegant confirm modal first!
  };

  const confirmAndPlaceOrder = async () => {
    setIsModalOpen(false);
    setCheckoutStatus('processing');
    try {
      const response = await axios.post('http://localhost:5000/api/orders/checkout', {
        items: cartItems.map(item => ({ productId: item.id, quantity: item.quantity }))
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        setCheckoutStatus('success');
        clearCart();
        setIsSuccessModalOpen(true); // Open the fancy new success popup!
      }
    } catch (error) {
      setCheckoutStatus('error');
      setErrorMsg(error.response?.data?.message || 'Đã xảy ra lỗi khi đặt hàng');
    }
  };

  if (cartItems.length === 0 && !isSuccessModalOpen) {
    return (
      <div style={{ paddingTop: '120px', minHeight: '80vh', textAlign: 'center' }}>
        <div className="container">
          <ShoppingBag size={80} color="var(--text-muted)" style={{ marginBottom: '20px', opacity: 0.4 }} />
          <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>Giỏ hàng trống</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Hãy khám phá bộ sưu tập nội thất sang trọng của chúng tôi!</p>
          <Link to="/products" className="btn btn-primary">Khám phá sản phẩm</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '100px', minHeight: '80vh' }}>
      <div className="container" style={{ padding: '40px 20px' }}>
        <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '30px', transition: 'color 0.3s' }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--secondary)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={18} /> Tiếp tục mua sắm
        </Link>

        <h1 className="section-title" style={{ marginBottom: '40px' }}>Giỏ Hàng Của Bạn</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }}>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image || item.mainImage} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <h3 style={{ color: 'var(--primary)', marginBottom: '5px' }}>{item.name}</h3>
                  <div>
                    {item.discountPrice && (
                      <span style={{ textDecoration: 'line-through', fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '8px' }}>
                        {Number(item.price).toLocaleString('vi-VN')} ₫
                      </span>
                    )}
                    <span style={{ color: 'var(--secondary)', fontWeight: '600', fontSize: '1.1rem' }}>
                      {Number(item.discountPrice || item.price).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                </div>
                <div className="cart-item-quantity">
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Minus size={16} />
                  </button>
                  <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '600' }}>{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus size={16} />
                  </button>
                </div>
                <div style={{ minWidth: '120px', textAlign: 'right' }}>
                  <p style={{ fontWeight: '700', color: 'var(--primary)' }}>
                    {(Number(item.discountPrice || item.price) * item.quantity).toLocaleString('vi-VN')} ₫
                  </p>
                </div>
                <button
                  className="cart-remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="cart-summary">
            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', marginBottom: '25px' }}>Tóm tắt đơn hàng</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-muted)' }}>
              <span>Tạm tính ({cartItems.reduce((s, i) => s + i.quantity, 0)} sản phẩm)</span>
              <span>{cartTotal.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-muted)' }}>
              <span>Phí vận chuyển</span>
              <span style={{ color: '#27ae60' }}>Miễn phí</span>
            </div>
            <div style={{ borderTop: '2px solid #eee', paddingTop: '15px', marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary)' }}>Tổng cộng</span>
              <span style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--secondary)' }}>{cartTotal.toLocaleString('vi-VN')} ₫</span>
            </div>

            {checkoutStatus === 'error' && (
              <p style={{ color: '#e74c3c', marginTop: '15px', fontSize: '0.9rem' }}>{errorMsg}</p>
            )}

            <button
              className="btn-add-to-cart"
              style={{ width: '100%', justifyContent: 'center', marginTop: '25px' }}
              onClick={triggerCheckout}
              disabled={checkoutStatus === 'processing'}
            >
              {checkoutStatus === 'processing' ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
            </button>

            {!isLoggedIn && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '10px', textAlign: 'center' }}>
                Bạn cần <Link to="/login" style={{ color: 'var(--secondary)' }}>đăng nhập</Link> để đặt hàng
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Custom Confirm PopUp */}
      {isModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content" style={{ textAlign: 'center' }}>
            <ShoppingBag size={60} color="var(--secondary)" style={{ marginBottom: '20px' }} />
            <h2>Xác nhận đặt hàng?</h2>
            <p style={{ color: 'var(--text-muted)', margin: '15px 0 30px' }}>
              Yêu cầu đặt hàng tổng giá trị <b>{cartTotal.toLocaleString()} ₫</b> của bạn sẽ được gửi tới bộ phận kiểm duyệt.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirmAndPlaceOrder}>Chốt đơn</button>
              <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, background: 'none', border: '1px solid #ccc', borderRadius: '10px', cursor: 'pointer' }}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Custom Success PopUp */}
      {isSuccessModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content" style={{ textAlign: 'center', padding: '40px' }}>
            <CheckCircle size={70} color="#27ae60" style={{ marginBottom: '20px' }} />
            <h2 style={{ color: 'var(--primary)' }}>🎉 Gửi yêu cầu thành công!</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '15px', lineHeight: 1.6 }}>
              Cảm ơn bạn! Đơn hàng đã được chuyển trạng thái <b>Chờ duyệt</b>. <br />
              Vui lòng kiên nhẫn đợi phản hồi.
            </p>
            <button
              className="btn-add-to-cart"
              style={{ width: '100%', marginTop: '30px', justifyContent: 'center' }}
              onClick={() => { setIsSuccessModalOpen(false); navigate('/products'); }}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
