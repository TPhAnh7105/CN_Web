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
  const [paymentMethod, setPaymentMethod] = useState('cod'); // Default payment method
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [provCode, setProvCode] = useState('');
  const [distCode, setDistCode] = useState('');
  const [wardCode, setWardCode] = useState('');

  const [selectedProv, setSelectedProv] = useState('');
  const [selectedDist, setSelectedDist] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [specificAddr, setSpecificAddr] = useState('');

  const parseAddress = (addressStr) => {
    if (!addressStr) return { specific: '', ward: '', district: '', province: '' };
    const parts = addressStr.split(',').map(p => p.trim());
    if (parts.length >= 4) {
      const province = parts.pop();
      const district = parts.pop();
      const ward = parts.pop();
      const specific = parts.join(', ');
      return { specific, ward, district, province };
    }
    return { specific: addressStr, ward: '', district: '', province: '' };
  };

  React.useEffect(() => {
    const initAddressData = async () => {
      try {
        const provRes = await axios.get('https://provinces.open-api.vn/api/p/');
        setProvinces(provRes.data);

        if (isLoggedIn) {
          const res = await axios.get('http://localhost:5000/api/users/profile', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          const defaultAddr = res.data.address;
          if (defaultAddr) {
            setDeliveryAddress(defaultAddr);
            const parsed = parseAddress(defaultAddr);
            setSpecificAddr(parsed.specific);

            const matchingProv = provRes.data.find(p => p.name === parsed.province);
            if (matchingProv) {
              setProvCode(matchingProv.code);
              setSelectedProv(matchingProv.name);

              const distRes = await axios.get(`https://provinces.open-api.vn/api/p/${matchingProv.code}?depth=2`);
              setDistricts(distRes.data.districts);

              const matchingDist = distRes.data.districts.find(d => d.name === parsed.district);
              if (matchingDist) {
                setDistCode(matchingDist.code);
                setSelectedDist(matchingDist.name);

                const wardRes = await axios.get(`https://provinces.open-api.vn/api/d/${matchingDist.code}?depth=2`);
                setWards(wardRes.data.wards);

                const matchingWard = wardRes.data.wards.find(w => w.name === parsed.ward);
                if (matchingWard) {
                  setWardCode(matchingWard.code);
                  setSelectedWard(matchingWard.name);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Error initializing address data in cart", err);
      }
    };
    initAddressData();
  }, [isLoggedIn]);

  // Sync subfields changes back to deliveryAddress state
  React.useEffect(() => {
    if (selectedProv && selectedDist && selectedWard) {
      setDeliveryAddress(`${specificAddr.trim()}, ${selectedWard}, ${selectedDist}, ${selectedProv}`);
    } else {
      setDeliveryAddress(specificAddr.trim());
    }
  }, [specificAddr, selectedWard, selectedDist, selectedProv]);

  const handleProvinceChange = async (e) => {
    const code = e.target.value;
    setProvCode(code);
    const name = e.target.options[e.target.selectedIndex].text;
    setSelectedProv(code ? name : '');

    setDistCode('');
    setSelectedDist('');
    setDistricts([]);
    setWardCode('');
    setSelectedWard('');
    setWards([]);

    if (code) {
      try {
        const res = await axios.get(`https://provinces.open-api.vn/api/p/${code}?depth=2`);
        setDistricts(res.data.districts);
      } catch (error) {
        console.error("Error fetching districts", error);
      }
    }
  };

  const handleDistrictChange = async (e) => {
    const code = e.target.value;
    setDistCode(code);
    const name = e.target.options[e.target.selectedIndex].text;
    setSelectedDist(code ? name : '');

    setWardCode('');
    setSelectedWard('');
    setWards([]);

    if (code) {
      try {
        const res = await axios.get(`https://provinces.open-api.vn/api/d/${code}?depth=2`);
        setWards(res.data.wards);
      } catch (error) {
        console.error("Error fetching wards", error);
      }
    }
  };

  const handleWardChange = (e) => {
    const code = e.target.value;
    setWardCode(code);
    const name = e.target.options[e.target.selectedIndex].text;
    setSelectedWard(code ? name : '');
  };

  const handleAddrChangeResetMsg = () => {
    if (checkoutStatus === 'error' && errorMsg === 'Vui lòng nhập địa chỉ giao hàng') {
      setCheckoutStatus(null);
      setErrorMsg('');
    }
  };

  const triggerCheckout = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!deliveryAddress || deliveryAddress.trim() === '') {
      setErrorMsg('Vui lòng nhập địa chỉ giao hàng');
      setCheckoutStatus('error');
      return;
    }
    setIsModalOpen(true); // Open elegant confirm modal first!
  };

  const confirmAndPlaceOrder = async () => {
    setIsModalOpen(false);
    setCheckoutStatus('processing');
    try {
      const response = await axios.post('http://localhost:5000/api/orders/checkout', {
        items: cartItems.map(item => ({ productId: item.id, quantity: item.quantity, color: item.selectedColor, size: item.selectedSize })),
        paymentMethod: paymentMethod,
        deliveryAddress: deliveryAddress,
        voucherCode: appliedVoucher ? appliedVoucher.code : undefined
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

  const applyVoucher = async () => {
    if (!voucherCodeInput.trim()) return;
    setVoucherError('');
    try {
      const res = await axios.post('http://localhost:5000/api/vouchers/apply', { code: voucherCodeInput.trim(), cartTotal }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAppliedVoucher(res.data);
    } catch (error) {
      setAppliedVoucher(null);
      setVoucherError(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCodeInput('');
  };

  const finalTotal = appliedVoucher ? cartTotal - appliedVoucher.discountAmount : cartTotal;

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
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                    {item.selectedSize && <span style={{ marginRight: '10px' }}>Size: <b>{item.selectedSize}</b></span>}
                    {item.selectedColor && <span>Màu: <b>{item.selectedColor}</b></span>}
                  </div>
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
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, item.quantity - 1)}>
                    <Minus size={16} />
                  </button>
                  <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '600' }}>{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, item.quantity + 1)}>
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
                  onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)}
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

            {/* Vouchers section */}
            <div style={{ marginTop: '20px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={voucherCodeInput}
                  onChange={e => setVoucherCodeInput(e.target.value)}
                  placeholder="Nhập mã giảm giá..."
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                  disabled={appliedVoucher !== null}
                />
                {!appliedVoucher ? (
                  <button onClick={applyVoucher} style={{ padding: '8px 15px', background: 'var(--primary)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Áp dụng</button>
                ) : (
                  <button onClick={removeVoucher} style={{ padding: '8px 15px', background: '#e74c3c', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Xóa mã</button>
                )}
              </div>
              {voucherError && <p style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '5px' }}>{voucherError}</p>}
              {appliedVoucher && <p style={{ color: '#27ae60', fontSize: '0.85rem', marginTop: '8px', fontWeight: 'bold' }}>✅ Đã áp dụng mã: giảm {Number(appliedVoucher.discountAmount).toLocaleString('vi-VN')} ₫</p>}
            </div>

            <div style={{ borderTop: '2px solid #eee', paddingTop: '15px', marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary)' }}>Tổng cộng</span>
              <span style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--secondary)' }}>{finalTotal.toLocaleString('vi-VN')} ₫</span>
            </div>

            {/* Address */}
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '10px', fontSize: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Địa chỉ giao hàng</span>
                <Link to="/profile" style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 'normal' }}>Sửa mặc định</Link>
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <select
                    value={provCode}
                    onChange={(e) => { handleProvinceChange(e); handleAddrChangeResetMsg(); }}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', outline: 'none' }}
                  >
                    <option value="">-- Chọn Tỉnh/Thành --</option>
                    {provinces.map(p => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <select
                    value={distCode}
                    onChange={(e) => { handleDistrictChange(e); handleAddrChangeResetMsg(); }}
                    disabled={!provCode}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', outline: 'none', background: !provCode ? '#f5f5f5' : '#fff' }}
                  >
                    <option value="">-- Chọn Quận/Huyện --</option>
                    {districts.map(d => (
                      <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                  </select>

                  <select
                    value={wardCode}
                    onChange={(e) => { handleWardChange(e); handleAddrChangeResetMsg(); }}
                    disabled={!distCode}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', outline: 'none', background: !distCode ? '#f5f5f5' : '#fff' }}
                  >
                    <option value="">-- Chọn Phường/Xã --</option>
                    {wards.map(w => (
                      <option key={w.code} value={w.code}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <textarea
                value={specificAddr}
                onChange={(e) => {
                  setSpecificAddr(e.target.value);
                  handleAddrChangeResetMsg();
                }}
                placeholder="Số nhà, ngõ, tên đường cụ thể..."
                style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ marginTop: '20px' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '10px', fontSize: '1rem' }}>Phương thức thanh toán</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-muted)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} style={{ accentColor: 'var(--secondary)' }} />
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="radio" name="paymentMethod" value="wallet" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} style={{ accentColor: 'var(--secondary)' }} />
                  <span>Thanh toán bằng ví online</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'not-allowed', opacity: 0.5 }}>
                  <input type="radio" name="paymentMethod" value="bank_transfer" checked={paymentMethod === 'bank_transfer'} disabled={true} style={{ accentColor: 'var(--secondary)' }} />
                  <span>Thanh toán qua ngân hàng ( Đang bảo trì)</span>
                </label>
              </div>
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
              Yêu cầu đặt hàng tổng giá trị <b>{finalTotal.toLocaleString()} ₫</b> của bạn sẽ được gửi tới bộ phận kiểm duyệt.
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
