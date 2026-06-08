import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { ArrowDownRight, ArrowUpLeft, Eye, ShoppingBag, DollarSign, Package } from 'lucide-react';

const Transactions = () => {
  const { token, user } = useAuth();
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.tab || 'orders');
  const [txList, setTxList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  
  const [selectedTx, setSelectedTx] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (location.state?.tab) {
      setTab(location.state.tab);
    }
  }, [location.state?.tab]);

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

  const handlePrintOrder = () => {
    if(!selectedOrder) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa Đơn #${selectedOrder.id}</title>
          <style>
            @media print { 
              body { padding: 0; } 
              .no-print { display: none !important; }
            }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; line-height: 1.5; color: #333; max-width: 600px; margin: 0 auto; background: #fff; }
            h1 { text-align: center; color: #2c3e50; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; }
            .header { margin-bottom: 20px; border-bottom: 2px dashed #ccc; padding-bottom: 15px; }
            .info { margin-bottom: 20px; font-size: 14px; }
            .info p { margin: 6px 0; display: flex; justify-content: space-between; }
            .info p strong { color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            th, td { border-bottom: 1px solid #eee; padding: 10px 4px; text-align: left; }
            th { background-color: #fafafa; font-weight: bold; color: #2c3e50; border-bottom: 2px solid #333; }
            td:nth-child(2), th:nth-child(2) { text-align: center; }
            td:nth-child(3), th:nth-child(3) { text-align: center; }
            td:last-child, th:last-child { text-align: right; font-weight: 600; }
            .summary-row { display: flex; justify-content: space-between; margin-top: 15px; font-size: 14px; }
            .total { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; margin-top: 15px; color: #e74c3c; border-top: 2px dashed #ccc; padding-top: 15px; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #7f8c8d; border-top: 1px solid #eee; padding-top: 15px; }
            .print-btn { background: #2ecc71; color: white; border: none; padding: 10px 20px; font-size: 16px; border-radius: 5px; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; margin: 0 auto 20px; width: 100%; max-width: 200px; box-shadow: 0 4px 6px rgba(46, 204, 113, 0.2); transition: 0.2s; }
            .print-btn:hover { background: #27ae60; transform: translateY(-1px); }
          </style>
        </head>
        <body>
          <div class="no-print">
            <button class="print-btn" onclick="window.print()">🖨️ In Hóa Đơn</button>
          </div>
          <div class="header">
            <h1>LUXE FURNISH</h1>
            <h2 style="text-align:center; font-size: 16px; color: #555; margin-top: 0; margin-bottom: 5px;">HÓA ĐƠN MUA HÀNG</h2>
            <p style="text-align:center; font-size: 12px; color: #777; margin: 0;">Mã đơn hàng: #${selectedOrder.id} | Ngày đặt: ${new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}</p>
          </div>
          
          <div class="info">
            <p><strong>Khách hàng:</strong> <span>${user?.username} (${user?.email})</span></p>
            <p><strong>Địa chỉ nhận hàng:</strong> <span style="text-align:right; max-width:60%">${selectedOrder.deliveryAddress || 'Nhận tại cửa hàng'}</span></p>
            <p><strong>Phương thức TT:</strong> <span>${selectedOrder.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : selectedOrder.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 'Thanh toán qua ví'}</span></p>
            <p><strong>Trạng thái đơn:</strong> <span>${selectedOrder.status === 'approved' ? 'Đã thanh toán / Phê duyệt' : selectedOrder.status}</span></p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Đơn giá</th>
                <th>SL</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${selectedOrder.OrderItems?.map(item => `
                <tr>
                  <td>${item.Product?.name || 'Sản phẩm đã xóa'}</td>
                  <td>${Number(item.priceAtTime).toLocaleString()} ₫</td>
                  <td>${item.quantity}</td>
                  <td>${(Number(item.priceAtTime) * item.quantity).toLocaleString()} ₫</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          ${selectedOrder.voucherCode ? `<div class="summary-row"><span>Mã giảm giá áp dụng (${selectedOrder.voucherCode}):</span> <b style="color: #e74c3c">-${Number(selectedOrder.discountAmount).toLocaleString()} ₫</b></div>` : ''}
          
          <div class="total">
            <span>TỔNG CỘNG:</span> 
            <span>${Number(selectedOrder.totalAmount).toLocaleString()} ₫</span>
          </div>

          <div class="footer">
            <p>Cảm ơn quý khách đã mua sắm tại Luxe Furnish!</p>
            <p>Hotline: 1900 1234 | Website: www.luxefurnish.com</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  };

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
            {/* Hộp theo dõi đơn hàng hiện tại (mới nhất) */}
            {orderList.length > 0 && (
              <div style={{ background: '#fcfbf7', padding: '25px', borderBottom: '2px solid #eee', borderLeft: '4px solid var(--secondary)' }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                  <Package size={20} color="var(--secondary)" /> Đơn hàng hiện tại (Đơn mới nhất)
                </h4>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '1.15rem', color: 'var(--primary)' }}>Yêu cầu đơn hàng #{orderList[0].id}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '3px' }}>Đặt ngày: {new Date(orderList[0].createdAt).toLocaleString('vi-VN')}</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--secondary)', marginTop: '8px' }}>
                      Tổng cộng: {Number(orderList[0].totalAmount).toLocaleString('vi-VN')} ₫
                    </div>
                  </div>
                  
                  {/* Stepper Trực quan hóa tiến trình Xét Duyệt */}
                  <div style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '12px 20px', borderRadius: '12px', border: '1px solid #f0eee8', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {/* Step 1: Đã Đặt */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#27ae60', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>✓</div>
                        <span style={{ fontSize: '0.75rem', marginTop: '6px', fontWeight: '600', color: 'var(--text-main)' }}>Đã đặt đơn</span>
                      </div>
                      
                      {/* Line connecting */}
                      <div style={{ width: '40px', height: '3px', background: orderList[0].status === 'pending' ? '#e0e0e0' : (orderList[0].status === 'approved' ? '#27ae60' : '#e74c3c'), marginTop: '-15px' }}></div>
                      
                      {/* Step 2: Kết quả xét duyệt */}
                      {orderList[0].status === 'cancelled' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e74c3c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>✗</div>
                          <span style={{ fontSize: '0.75rem', marginTop: '6px', fontWeight: '600', color: '#e74c3c' }}>Đã từ chối</span>
                        </div>
                      ) : orderList[0].status === 'approved' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#27ae60', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>✓</div>
                          <span style={{ fontSize: '0.75rem', marginTop: '6px', fontWeight: '600', color: '#27ae60' }}>Được duyệt</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f39c12', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold', animation: 'pulse 1.5s infinite', border: '2px solid #fff' }}>•</div>
                          <span style={{ fontSize: '0.75rem', marginTop: '6px', fontWeight: '600', color: '#f39c12' }}>Chờ duyệt...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <button 
                      onClick={() => setSelectedOrder(orderList[0])} 
                      className="btn btn-primary"
                      style={{ padding: '10px 18px', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Eye size={16} /> Chi tiết đơn
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Danh sách toàn bộ đơn hàng */}
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
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {item.size && <span style={{ marginRight: '8px' }}>Size: {item.size}</span>}
                      {item.color && <span>Màu: {item.color}</span>}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '2px' }}>{Number(item.priceAtTime).toLocaleString('vi-VN')} ₫ <span style={{ margin: '0 5px' }}>x</span> <strong>{item.quantity}</strong></div>
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

            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <button className="btn-secondary" style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '1.05rem', background: '#3498db', color: 'white', border: 'none', cursor: 'pointer' }} onClick={handlePrintOrder}>
                📄 Xuất Hóa Đơn
              </button>
              <button className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '1.05rem' }} onClick={() => setSelectedOrder(null)}>
                Đóng
              </button>
            </div>
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
