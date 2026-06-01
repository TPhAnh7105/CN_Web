import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowDownRight, ArrowUpLeft, Eye, ShoppingBag, DollarSign } from 'lucide-react';

const Transactions = () => {
  const { token } = useAuth();
  const [tab, setTab] = useState('orders'); // 'orders' or 'transactions'
  const [txList, setTxList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  
  const [selectedTx, setSelectedTx] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [txRes, orderRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users/transactions', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/orders/myorders', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setTxList(txRes.data);
        setOrderList(orderRes.data);
      } catch (err) {
        console.error("Error fetching history", err);
      }
    };
    if(token) loadData();
  }, [token]);

  return (
    <div style={{ paddingTop: '120px', minHeight: '80vh' }} className="container">
      <h2 className="section-title" style={{ marginBottom: '20px' }}>Quản lý cá nhân</h2>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
        <button 
          onClick={() => setTab('orders')}
          className={`btn ${tab === 'orders' ? 'btn-primary' : ''}`}
          style={{ background: tab === 'orders' ? 'var(--primary)' : '#eee', color: tab === 'orders' ? '#fff' : '#333', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ShoppingBag size={18} /> Lịch sử mua hàng
        </button>
        <button 
          onClick={() => setTab('transactions')}
          className={`btn ${tab === 'transactions' ? 'btn-primary' : ''}`}
          style={{ background: tab === 'transactions' ? 'var(--primary)' : '#eee', color: tab === 'transactions' ? '#fff' : '#333', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <DollarSign size={18} /> Giao dịch ví
        </button>
      </div>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        
        {/* ORDER TAB */}
        {tab === 'orders' && (
          <div>
            {orderList.map(o => (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', borderBottom: '1px solid #eee' }}>
                <div style={{ background: '#f0f7ff', padding: '12px', borderRadius: '50%' }}><ShoppingBag color="#3498db" /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '1.05rem' }}>Đơn hàng #{o.id}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleString('vi-VN')}</div>
                  <div style={{ marginTop: '5px' }}>
                    <span style={{ fontSize: '0.85rem', padding: '3px 8px', borderRadius: '12px', background: o.status === 'pending' ? '#fdf2e9' : (o.status === 'approved' ? '#e8f6ec' : '#fdecea'), color: o.status === 'pending' ? '#e67e22' : (o.status === 'approved' ? '#27ae60' : '#e74c3c') }}>
                      {o.status === 'pending' ? 'Đang chờ duyệt' : (o.status === 'approved' ? 'Hoàn thành' : 'Đã hủy')}
                    </span>
                  </div>
                </div>
                <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1.1rem' }}>
                  {Number(o.totalAmount).toLocaleString('vi-VN')} ₫
                </div>
                <button 
                  onClick={() => setSelectedOrder(o)} 
                  title="Xem chi tiết đơn hàng"
                  style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', display: 'flex', alignItems: 'center' }}>
                    <Eye size={22} />
                </button>
              </div>
            ))}
            {orderList.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Bạn chưa có đơn hàng nào.</div>}
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {tab === 'transactions' && (
          <div>
            {txList.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', borderBottom: '1px solid #eee' }}>
                {t.type === 'deposit' || t.type === 'refund' ? <div style={{ background: '#e8f6ec', padding: '10px', borderRadius: '50%' }}><ArrowDownRight color="#27ae60" /></div> 
                                      : <div style={{ background: '#fdecea', padding: '10px', borderRadius: '50%' }}><ArrowUpLeft color="#e74c3c" /></div>}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600' }}>{t.description || (t.type === 'deposit' ? 'Nạp tiền' : (t.type === 'refund' ? 'Hoàn tiền' : 'Thanh toán'))}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleString('vi-VN')}</div>
                </div>
                <div style={{ fontWeight: '700', color: t.type === 'deposit' || t.type === 'refund' ? '#27ae60' : '#e74c3c', fontSize: '1.1rem' }}>
                  {t.type === 'deposit' || t.type === 'refund' ? '+' : '-'}{Number(t.amount).toLocaleString('vi-VN')} ₫
                </div>
                <button 
                  onClick={() => setSelectedTx(t)} 
                  title="Xem chi tiết giao dịch"
                  style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', display: 'flex', alignItems: 'center' }}>
                    <Eye size={22} />
                </button>
              </div>
            ))}
            {txList.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có giao dịch nào.</div>}
          </div>
        )}
      </div>

      {/* Modal Chi Tiết Đơn Hàng */}
      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26, 37, 48, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: 'var(--white)', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto', boxShadow: 'var(--shadow-md)', animation: 'fadeIn 0.3s' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid #eee', paddingBottom: '15px', fontSize: '1.4rem' }}>
              Chi Tiết Đơn Hàng #{selectedOrder.id}
            </h3>
            
            <div style={{ marginBottom: '20px', fontSize: '1rem', lineHeight: '1.6' }}>
              <p><strong>Ngày đặt:</strong> {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
              <p><strong>Trạng thái:</strong> <span style={{ fontWeight: '600', color: selectedOrder.status === 'pending' ? '#e67e22' : (selectedOrder.status === 'approved' ? '#27ae60' : '#e74c3c') }}>
                {selectedOrder.status === 'pending' ? 'Đang chờ duyệt' : (selectedOrder.status === 'approved' ? 'Hoàn thành' : 'Đã hủy')}
              </span></p>
              <p><strong>Địa chỉ giao hàng:</strong> {selectedOrder.deliveryAddress || 'Không có'}</p>
              <p><strong>Thanh toán bằng:</strong> {selectedOrder.paymentMethod === 'wallet' ? 'Ví trực tuyến' : (selectedOrder.paymentMethod === 'cod' ? 'Tiền mặt (COD)' : 'Chuyển khoản')}</p>
            </div>

            <h4 style={{ marginBottom: '10px', color: 'var(--primary)' }}>Danh sách sản phẩm:</h4>
            <div style={{ border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
              {selectedOrder.OrderItems?.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '15px', padding: '15px', borderBottom: '1px solid #eee', background: '#faf9f6' }}>
                  <img src={item.Product?.mainImage || 'https://via.placeholder.com/60'} alt={item.Product?.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{item.Product?.name || 'Sản phẩm đã bị xóa'}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{Number(item.priceAtTime).toLocaleString('vi-VN')} ₫ <span style={{ margin: '0 5px' }}>x</span> <strong>{item.quantity}</strong></div>
                  </div>
                  <div style={{ fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}>
                    {(Number(item.priceAtTime) * item.quantity).toLocaleString('vi-VN')} ₫
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '10px', marginBottom: '25px', textAlign: 'right' }}>
              {selectedOrder.voucherCode && (
                <div style={{ marginBottom: '5px', color: '#e74c3c' }}>
                  Giảm giá (Mã <strong>{selectedOrder.voucherCode}</strong>): -{Number(selectedOrder.discountAmount).toLocaleString('vi-VN')} ₫
                </div>
              )}
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary)' }}>
                Tổng cộng: {Number(selectedOrder.totalAmount).toLocaleString('vi-VN')} ₫
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '1.05rem' }} onClick={() => setSelectedOrder(null)}>
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Modal Chi Tiết Giao Dịch */}
      {selectedTx && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26, 37, 48, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: 'var(--white)', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '450px', boxShadow: 'var(--shadow-md)', animation: 'fadeIn 0.3s' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid #eee', paddingBottom: '15px', fontSize: '1.4rem' }}>
              Chi Tiết Giao Dịch
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.05rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Mã số:</span>
              <span style={{ fontWeight: '600' }}>#{selectedTx.id}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.05rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Loại giao dịch:</span>
              <span style={{ fontWeight: '600' }}>{selectedTx.type === 'deposit' ? 'Nạp tiền vào ví' : (selectedTx.type === 'refund' ? 'Hoàn tiền' : 'Thanh toán hóa đơn')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.05rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Số tiền:</span>
              <span style={{ fontWeight: '700', color: selectedTx.type === 'deposit' || selectedTx.type === 'refund' ? '#27ae60' : '#e74c3c', fontSize: '1.2rem' }}>
                {selectedTx.type === 'deposit' || selectedTx.type === 'refund' ? '+' : '-'}{Number(selectedTx.amount).toLocaleString('vi-VN')} ₫
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.05rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Thời gian:</span>
              <span style={{ fontWeight: '500' }}>{new Date(selectedTx.createdAt).toLocaleString('vi-VN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.05rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Trạng thái:</span>
              <span style={{ fontWeight: '600', color: '#27ae60', background: '#e8f6ec', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem' }}>
                {selectedTx.status === 'completed' ? 'Thành công' : selectedTx.status}
              </span>
            </div>

            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '10px', marginTop: '20px', marginBottom: '25px', fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
              <strong>Nội dung:</strong><br />
              {selectedTx.description || 'Không có nội dung ghi chú.'}
            </div>

            <button className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '1.05rem' }} onClick={() => setSelectedTx(null)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
