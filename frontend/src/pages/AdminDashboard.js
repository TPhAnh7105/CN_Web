import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { removeDiacritics } from '../utils/text';
import { ShoppingBag, Package, Users, Check, X, Trash, Plus, Edit2, AlertCircle, CheckCircle2, FolderOpen, Sofa, Palette, Coins, Activity, Eye, Percent, TrendingUp, MessageCircle, Send } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const AdminDashboard = () => {
  const { token, user } = useAuth();
  const [tab, setTab] = useState('orders');
  
  // Master Data
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [appUsers, setAppUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [segments, setSegments] = useState([]);
  const [types, setTypes] = useState([]);
  const [styles, setStyles] = useState([]);
  const [allTx, setAllTx] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [chatLogs, setChatLogs] = useState([]);

  // Real-time Filtered Attribute Sets
  const typeOpts = types;
  const styleOpts = styles;
  const segOpts = segments;

  // Interaction states
  const [activeModal, setActiveModal] = useState(null); 
  const [targetData, setTargetData] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const [prodForm, setProdForm] = useState({ name: '', price: '', stock: 10, type: '', style: '', segment: '', mainImage: '', categoryId: '' });
  const [catForm, setCatForm] = useState({ name: '' });
  const [newPromo, setNewPromo] = useState({ discountPrice: '', endDate: '' });
  const [genericAttrForm, setGenericAttrForm] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  // Chat admin reply state
  const [replySessionId, setReplySessionId] = useState(null);
  const [replyMessage, setReplyMessage] = useState(''); // simplified string name
  const [discountForm, setDiscountForm] = useState({ promoPrice: '' });
  const [searchProd, setSearchProd] = useState('');
  const [voucherForm, setVoucherForm] = useState({ code: '', discountPercent: '', maxDiscount: '', minOrderValue: '', usageLimit: 100, oncePerUser: true, startDate: '', endDate: '' });
  const [blockReasonForm, setBlockReasonForm] = useState('');
  const [blockExpiresAtForm, setBlockExpiresAtForm] = useState('');

  const headers = { Authorization: `Bearer ${token}` };
  const triggerToast = (msg, type='success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type }), 3000);
  };

  const fetchData = async () => {
    try {
      const [o, p, u, c, a, t, s, tx, vouchersRes, chatLogsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/orders', { headers }),
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/users', { headers }),
        axios.get('http://localhost:5000/api/categories'),
        axios.get('http://localhost:5000/api/segments'),
        axios.get('http://localhost:5000/api/types'),
        axios.get('http://localhost:5000/api/styles'),
        axios.get('http://localhost:5000/api/users/all-transactions', { headers }),
        axios.get('http://localhost:5000/api/vouchers', { headers }),
        axios.get('http://localhost:5000/api/chat/logs', { headers })
      ]);
      setOrders(o.data); 
      setProducts(p.data); 
      setAppUsers(u.data); 
      setCategories(c.data); 
      setSegments(a.data);
      setTypes(t.data);
      setStyles(s.data);
      setAllTx(tx.data);
      setVouchers(vouchersRes.data);
      setChatLogs(chatLogsRes.data);
    } catch (e) {}
  };

  const fetchChatLogs = async () => {
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:5000/api/chat/logs', { headers });
      setChatLogs(res.data);
    } catch(err) { console.error('Lỗi lấy chat logs', err); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { 
    if(token) {
      fetchData(); 
      const interval = setInterval(fetchChatLogs, 4000); // Tự động làm mới chat mỗi 4 giây
      return () => clearInterval(interval);
    }
  }, [token]);

  // Quản lý trạng thái đọc tin nhắn hỗ trợ
  const [readSessions, setReadSessions] = useState(new Set());
  
  const handleSelectSession = (sessionId) => {
    setReplySessionId(sessionId);
    setReadSessions(prev => {
      const newSet = new Set(prev);
      newSet.add(sessionId);
      return newSet;
    });
  };

  // Đếm số phiên chat đang chờ hỗ trợ (latest message = user_support)
  const [supportCount, setSupportCount] = useState(0);
  useEffect(() => {
    let count = 0;
    const sessionMap = {};
    chatLogs.forEach(log => {
      if (!sessionMap[log.sessionId]) {
        sessionMap[log.sessionId] = true;
        if (log.role === 'user_support' && log.sessionId !== replySessionId && !readSessions.has(log.sessionId)) {
          count++;
        }
      }
    });
    setSupportCount(count);
  }, [chatLogs, readSessions, replySessionId]);

  // Hiển thị thông báo toast khi đăng nhập / có tin nhắn mới lần đầu
  const [hasNotifiedSupport, setHasNotifiedSupport] = useState(false);
  useEffect(() => {
    if (supportCount > 0 && !hasNotifiedSupport) {
      triggerToast(`Bạn có ${supportCount} tin nhắn mới cần hỗ trợ!`, 'success');
      setHasNotifiedSupport(true);
    }
  }, [supportCount, hasNotifiedSupport]);

  // Handlers
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    setUploadingImage(true);
    try {
      const res = await axios.post('http://localhost:5000/api/upload/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.data.success) {
        setProdForm(prev => ({ ...prev, mainImage: res.data.url }));
        triggerToast('Tải ảnh lên thành công!');
      }
    } catch (err) {
      triggerToast('Lỗi tải ảnh: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setUploadingImage(false);
      e.target.value = null;
    }
  };
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const cMatch = categories.find(c => String(c.id) === String(prodForm.categoryId));
      const body = { ...prodForm, room: cMatch ? cMatch.name : '' };
      if(activeModal === 'editProd') await axios.put(`http://localhost:5000/api/products/${targetData.id}`, body, { headers });
      else await axios.post('http://localhost:5000/api/products', body, { headers });
      triggerToast('Thành công!'); setActiveModal(null); fetchData();
    } catch(e) { triggerToast('Lỗi!', 'error'); }
  };


  const saveAttribute = async (group) => {
    if(!genericAttrForm.trim()) return;
    try {
      if (group === 'type') {
        await axios.post('http://localhost:5000/api/types', { name: genericAttrForm }, { headers });
      } else if (group === 'style') {
        await axios.post('http://localhost:5000/api/styles', { name: genericAttrForm }, { headers });
      } else {
        await axios.post('http://localhost:5000/api/segments', { name: genericAttrForm }, { headers });
      }
      triggerToast(`Thêm ${genericAttrForm} thành công!`);
      setGenericAttrForm('');
      setActiveModal(null);
      fetchData();
    } catch(e) { triggerToast('Lỗi thêm!', 'error'); }
  };

  const deleteAttribute = async (id, group) => {
    try { 
      if (group === 'type') {
        await axios.delete(`http://localhost:5000/api/types/${id}`, { headers }); 
      } else if (group === 'style') {
        await axios.delete(`http://localhost:5000/api/styles/${id}`, { headers });
      } else {
        await axios.delete(`http://localhost:5000/api/segments/${id}`, { headers });
      }
      triggerToast('Đã xóa'); 
      fetchData(); 
    } catch(e) { triggerToast('Lỗi', 'error'); }
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    try { await axios.post('http://localhost:5000/api/categories', catForm, { headers }); triggerToast('Tạo danh mục thành công'); setActiveModal(null); fetchData(); }
    catch(e) { triggerToast('Lỗi', 'error'); }
  };

  const processOrder = async (type) => {
    try { await axios.put(`http://localhost:5000/api/orders/${targetData.id}/${type}`, {}, { headers }); triggerToast('Xong!'); fetchData(); }
    catch(e) { triggerToast('Lỗi', 'error'); }
    setActiveModal(null);
  };

  const deleteProduct = async () => {
    await axios.delete(`http://localhost:5000/api/products/${targetData.id}`, { headers });
    triggerToast('Đã xóa SP'); setActiveModal(null); fetchData();
  };

  const handlePrintOrder = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa Đơn #${targetData.id}</title>
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
            <p style="text-align:center; font-size: 12px; color: #777; margin: 0;">Mã đơn hàng: #${targetData.id} | Ngày đặt: ${new Date(targetData.createdAt).toLocaleDateString('vi-VN')}</p>
          </div>
          
          <div class="info">
            <p><strong>Khách hàng:</strong> <span>${targetData.User?.username} (${targetData.User?.email})</span></p>
            <p><strong>Địa chỉ nhận hàng:</strong> <span style="text-align:right; max-width:60%">${targetData.deliveryAddress || 'Nhận tại cửa hàng'}</span></p>
            <p><strong>Phương thức TT:</strong> <span>${targetData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : targetData.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 'Thanh toán qua ví'}</span></p>
            <p><strong>Trạng thái đơn:</strong> <span>${targetData.status === 'approved' ? 'Đã thanh toán / Phê duyệt' : targetData.status}</span></p>
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
              ${targetData.OrderItems?.map(item => `
                <tr>
                  <td>${item.Product?.name || 'Sản phẩm đã xóa'}</td>
                  <td>${Number(item.priceAtTime).toLocaleString()} ₫</td>
                  <td>${item.quantity}</td>
                  <td>${(Number(item.priceAtTime) * item.quantity).toLocaleString()} ₫</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          ${targetData.voucherCode ? `<div class="summary-row"><span>Mã giảm giá áp dụng (${targetData.voucherCode}):</span> <b style="color: #e74c3c">-${Number(targetData.discountAmount).toLocaleString()} ₫</b></div>` : ''}
          
          <div class="total">
            <span>TỔNG CỘNG:</span> 
            <span>${Number(targetData.totalAmount).toLocaleString()} ₫</span>
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

  const processBlock = async (userId, reason, expiresAt = null) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}/block`, { reason, expiresAt }, { headers });
      triggerToast('Đã cập nhật trạng thái tài khoản');
      setActiveModal(null);
      setBlockReasonForm('');
      setBlockExpiresAtForm('');
      fetchData();
    } catch(err) {
      triggerToast(err.response?.data?.message || 'Lỗi', 'error');
    }
  };

  const saveVoucher = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/vouchers', voucherForm, { headers });
      triggerToast('Tạo mã giảm giá thành công'); setActiveModal(null); fetchData();
    } catch(err) { triggerToast(err.response?.data?.message || 'Lỗi', 'error'); }
  };

  const deleteVoucher = async (id) => {
    try { await axios.delete(`http://localhost:5000/api/vouchers/${id}`, { headers }); triggerToast('Đã xóa mã'); fetchData(); }
    catch(err) { triggerToast('Lỗi', 'error'); }
  };

  const createAttribute = async (type) => {
    try {
      await axios.post('http://localhost:5000/api/attributes', { name: genericAttrForm, type }, { headers });
      triggerToast('Thêm thuộc tính thành công');
      setActiveModal(null);
      fetchData();
    } catch (err) { triggerToast('Lỗi khi thêm', 'error'); }
  };

  const handleAdminReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !replySessionId) return;
    try {
      await axios.post('http://localhost:5000/api/chat/admin-reply', 
        { sessionId: replySessionId, message: replyMessage }, 
        { headers }
      );
      setReplyMessage('');
      fetchData(); // Tải lại dữ liệu chat logs
      // triggerToast('Đã gửi phản hồi', 'success'); // Optional, bỏ đi cho đỡ phiền khi chat liên tục
    } catch (err) {
      triggerToast('Lỗi gửi phản hồi', 'error');
    }
  };

  if (!user || user.role !== 'admin') return <div style={{padding:'100px',textAlign:'center'}}><h3>Truy cập bị từ chối</h3></div>;

  return (
    <div style={{ paddingTop: '100px', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      
      {/* System Toast */}
      <div className={`toast-notification toast-${toast.type} ${toast.show ? 'active' : ''}`}>
        {toast.type === 'success' ? <CheckCircle2 color="#27ae60"/> : <AlertCircle color="#e74c3c"/>}
        <span style={{fontWeight:600}}>{toast.msg}</span>
      </div>

      {/* Dynamic Modals */}
      {activeModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content" style={{maxWidth: activeModal === 'viewOrder' ? '700px' : (activeModal.includes('Prod') ? '600px' : '400px')}}>
            
            {(activeModal === 'addProd' || activeModal === 'editProd') && (
              <form onSubmit={handleSaveProduct}>
                <h3>{activeModal === 'editProd' ? 'Sửa sản phẩm' : 'Thêm SP'}</h3>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop:'15px'}}>
                  <div style={{gridColumn:'1/-1'}}><label>Tên</label><input className="admin-input" value={prodForm.name} required onChange={e=>setProdForm({...prodForm, name:e.target.value})}/></div>
                  <div><label>Giá</label><input className="admin-input" type="number" value={prodForm.price} required onChange={e=>setProdForm({...prodForm, price:e.target.value})}/></div>
                  <div><label>Kho</label><input className="admin-input" type="number" value={prodForm.stock} required onChange={e=>setProdForm({...prodForm, stock:e.target.value})}/></div>
                  <div><label>Danh mục (Phòng)</label><select className="admin-input" value={prodForm.categoryId} required onChange={e=>setProdForm({...prodForm, categoryId:e.target.value})}><option value="">- Chọn -</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  <div><label>Loại nội thất</label><select className="admin-input" value={prodForm.type} required onChange={e=>setProdForm({...prodForm, type:e.target.value})}><option value="">- Chọn -</option>{typeOpts.map(t=><option key={t.id} value={t.name}>{t.name}</option>)}</select></div>
                  <div><label>Phong cách</label><select className="admin-input" value={prodForm.style} required onChange={e=>setProdForm({...prodForm, style:e.target.value})}><option value="">- Chọn -</option>{styleOpts.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
                  <div><label>Phân khúc</label><select className="admin-input" value={prodForm.segment} required onChange={e=>setProdForm({...prodForm, segment:e.target.value})}><option value="">- Chọn -</option>{segOpts.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
                  <div><label>Kích cỡ (Tùy chọn)</label><input className="admin-input" placeholder="VD: S, M, L (Cách bởi dấu phẩy)" value={prodForm.sizes || ''} onChange={e=>setProdForm({...prodForm, sizes:e.target.value})}/></div>
                  <div><label>Màu sắc (Tùy chọn)</label><input className="admin-input" placeholder="VD: Trắng, Đen (Cách bởi dấu phẩy)" value={prodForm.colors || ''} onChange={e=>setProdForm({...prodForm, colors:e.target.value})}/></div>
                  <div style={{gridColumn:'1/-1'}}>
                    <label>Ảnh sản phẩm (URL hoặc tải lên)</label>
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                      <input className="admin-input" style={{flex: 1}} placeholder="Nhập URL hoặc tải file bên cạnh" value={prodForm.mainImage} onChange={e=>setProdForm({...prodForm, mainImage:e.target.value})}/>
                      <input type="file" accept="image/*" id="mainImageUpload" style={{display: 'none'}} onChange={handleImageUpload} />
                      <label htmlFor="mainImageUpload" style={{background: 'var(--primary)', color: 'white', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600, display: 'flex', alignItems: 'center', margin: 0, height: '100%', boxSizing: 'border-box'}}>
                        {uploadingImage ? 'Đang tải...' : 'Tải lên từ máy'}
                      </label>
                    </div>
                  </div>
                  <div style={{gridColumn:'1/-1'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 5}}>
                      <label style={{marginBottom: 0}}>Mô tả ngắn (Hiển thị ngay dưới giá)</label>
                    </div>
                    <textarea className="admin-input" rows="2" value={prodForm.description || ''} onChange={e=>setProdForm({...prodForm, description:e.target.value})} placeholder="Viết mô tả ngắn gọn..."></textarea>
                  </div>
                  <div style={{gridColumn:'1/-1'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 5}}>
                      <label style={{marginBottom: 0}}>Mô tả chi tiết (Bài viết đầy đủ)</label>
                      <div style={{display:'flex', gap:10}}>
                        <input type="file" accept="image/*" id="descImageUpload" style={{display: 'none'}} onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append('file', file);
                          setUploadingImage(true);
                          try {
                            const res = await axios.post('http://localhost:5000/api/upload/file', formData, {
                              headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
                            });
                            if (res.data.success) {
                              setProdForm(prev => ({...prev, detailedDescription: (prev.detailedDescription || '') + `\n<img src="${res.data.url}" style="width:100%; border-radius:8px; margin: 10px 0;" alt="img" />\n`}));
                              triggerToast('Đã chèn ảnh vào mô tả!');
                            }
                          } catch (err) {
                            triggerToast('Lỗi tải ảnh: ' + (err.response?.data?.message || err.message), 'error');
                          } finally {
                            setUploadingImage(false);
                            e.target.value = null;
                          }
                        }} />
                        <label htmlFor="descImageUpload" style={{fontSize: '0.75rem', padding: '5px 10px', background: '#27ae60', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center'}}>
                          ⬆️ Tải ảnh lên
                        </label>
                        <button type="button" onClick={() => {
                          const url = prompt("Nhập link ảnh (URL) để chèn vào bài viết:");
                          if (url) {
                            setProdForm({...prodForm, detailedDescription: (prodForm.detailedDescription || '') + `\n<img src="${url}" style="width:100%; border-radius:8px; margin: 10px 0;" alt="img" />\n`});
                          }
                        }} style={{fontSize: '0.75rem', padding: '5px 10px', background: '#34495e', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer'}}>
                          🖼️ Chèn link ảnh
                        </button>
                      </div>
                    </div>
                    <textarea className="admin-input" rows="8" value={prodForm.detailedDescription || ''} onChange={e=>setProdForm({...prodForm, detailedDescription:e.target.value})} placeholder="Viết mô tả dài hoặc dán mã HTML/ảnh..."></textarea>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop:15}}>💾 Lưu</button>
                <button type="button" style={{width:'100%', background:'none', border:'none', marginTop:5}} onClick={()=>setActiveModal(null)}>Hủy</button>
              </form>
            )}

            {activeModal === 'addCat' && (
              <form onSubmit={saveCategory}>
                <h3>Tạo Danh Mục</h3>
                <input className="admin-input" style={{marginTop:15}} placeholder="Tên danh mục" required onChange={e=>setCatForm({...catForm, name:e.target.value})}/>
                <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop:10}}>Xác nhận</button>
                <button type="button" onClick={()=>setActiveModal(null)} style={{width:'100%', background:'none', border:'none', marginTop:5}}>Hủy</button>
              </form>
            )}

            {activeModal === 'addVoucher' && (
              <form onSubmit={saveVoucher}>
                <h3>Tạo Mã Giảm Giá</h3>
                <div style={{display:'grid', gap:'10px', marginTop:'15px'}}>
                  <div><label>Mã Code (Tùy chọn ghi liền không dấu)</label><input className="admin-input" value={voucherForm.code} required onChange={e=>setVoucherForm({...voucherForm, code:e.target.value.toUpperCase()})}/></div>
                  <div><label>% Giảm giá (1-100)</label><input className="admin-input" type="number" min="1" max="100" value={voucherForm.discountPercent} required onChange={e=>setVoucherForm({...voucherForm, discountPercent:e.target.value})}/></div>
                  <div><label>Giảm tối đa (₫)</label><input className="admin-input" type="number" value={voucherForm.maxDiscount} onChange={e=>setVoucherForm({...voucherForm, maxDiscount:e.target.value})}/></div>
                  <div><label>Đơn tối thiểu (₫)</label><input className="admin-input" type="number" value={voucherForm.minOrderValue} required onChange={e=>setVoucherForm({...voucherForm, minOrderValue:e.target.value})}/></div>
                  <div><label>Lượt sử dụng tối đa</label><input className="admin-input" type="number" value={voucherForm.usageLimit} required onChange={e=>setVoucherForm({...voucherForm, usageLimit:e.target.value})}/></div>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'5px'}}>
                    <input type="checkbox" id="oncePerUser" checked={voucherForm.oncePerUser} onChange={e=>setVoucherForm({...voucherForm, oncePerUser:e.target.checked})}/>
                    <label htmlFor="oncePerUser" style={{cursor:'pointer', fontWeight:'600'}}>Mỗi người dùng chỉ được sử dụng 1 lần</label>
                  </div>
                  <div><label>Thời gian bắt đầu</label><input className="admin-input" type="datetime-local" value={voucherForm.startDate} onChange={e=>setVoucherForm({...voucherForm, startDate:e.target.value})}/></div>
                  <div><label>Thời gian kết thúc</label><input className="admin-input" type="datetime-local" value={voucherForm.endDate} onChange={e=>setVoucherForm({...voucherForm, endDate:e.target.value})}/></div>
                </div>
                <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop:15}}>Tạo Mã Mới</button>
                <button type="button" onClick={()=>setActiveModal(null)} style={{width:'100%', background:'none', border:'none', marginTop:5}}>Hủy</button>
              </form>
            )}

            {activeModal.startsWith('addAttr') && (
              <div>
                <h3>
                  {activeModal === 'addAttrType' && '➕ Thêm Loại Nội Thất'}
                  {activeModal === 'addAttrStyle' && '➕ Thêm Phong Cách'}
                  {activeModal === 'addAttrSeg' && '➕ Thêm Phân Khúc'}
                </h3>
                <input className="admin-input" style={{marginTop:15}} placeholder="Nhập tên mới..." value={genericAttrForm} onChange={e=>setGenericAttrForm(e.target.value)}/>

                <button className="btn btn-primary" style={{width:'100%'}} onClick={()=>{
                  if(activeModal === 'addAttrType') saveAttribute('type');
                  if(activeModal === 'addAttrStyle') saveAttribute('style');
                  if(activeModal === 'addAttrSeg') saveAttribute('segment');
                }}>Tạo mới</button>
                <button style={{width:'100%', background:'none', border:'none', marginTop:5}} onClick={()=>setActiveModal(null)}>Đóng</button>
              </div>
            )}

            {activeModal.startsWith('confirm') && (
              <div style={{textAlign:'center'}}>
                <AlertCircle size={50} color="#e67e22"/><h3 style={{margin:'10px 0'}}>Xác nhận hành động?</h3>
                <button className="btn btn-primary" style={{background:'#e74c3c',width:'100%'}} onClick={()=>{
                  if(activeModal==='confirmApr') processOrder('approve');
                  if(activeModal==='confirmRej') processOrder('reject');
                  if(activeModal==='confirmDelPrd') deleteProduct();
                }}>Đồng ý</button>
                <button style={{width:'100%',background:'none',border:'none',marginTop:5}} onClick={()=>setActiveModal(null)}>Bỏ qua</button>
              </div>
            )}

            {activeModal === 'blockUser' && (
              <form onSubmit={(e)=>{e.preventDefault(); processBlock(targetData.id, blockReasonForm, blockExpiresAtForm || null);}}>
                <h3>Khóa tài khoản {targetData.username}</h3>
                <label style={{marginTop:15, display:'block'}}>Lý do khóa:</label>
                <input className="admin-input" required placeholder="Nhập lý do vi phạm..." value={blockReasonForm} onChange={e=>setBlockReasonForm(e.target.value)} />
                <label style={{marginTop:15, display:'block'}}>Thời hạn khóa (Để trống nếu khóa vĩnh viễn):</label>
                <input type="datetime-local" className="admin-input" value={blockExpiresAtForm} onChange={e=>setBlockExpiresAtForm(e.target.value)} />
                <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop:15, background:'#e74c3c'}}>Khóa ngay</button>
                <button type="button" onClick={()=>setActiveModal(null)} style={{width:'100%', background:'none', border:'none', marginTop:5}}>Hủy</button>
              </form>
            )}

            {activeModal === 'viewOrder' && targetData && (
              <div>
                <h3>Chi tiết đơn hàng #{targetData.id}</h3>
                <p>Khách hàng: <b>{targetData.User?.username}</b> ({targetData.User?.email})</p>
                <p>Thanh toán: <b>{targetData.paymentMethod === 'cod' ? 'Khi nhận hàng (COD)' : targetData.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 'Ví online'}</b></p>
                <p>Địa chỉ giao hàng: <b>{targetData.deliveryAddress || 'Chưa cập nhật'}</b></p>
                {targetData.voucherCode && (
                  <p>Mã giảm giá: <b style={{color: '#e74c3c'}}>{targetData.voucherCode}</b> (-{Number(targetData.discountAmount).toLocaleString()} ₫)</p>
                )}
                <div style={{maxHeight:'300px', overflowY:'auto', margin:'15px 0'}}>
                  <table className="admin-table" style={{fontSize:'0.9rem'}}>
                    <thead><tr><th>Sản phẩm</th><th>SL</th><th>Giá</th><th>Tổng</th></tr></thead>
                    <tbody>
                      {targetData.OrderItems?.map(item => (
                        <tr key={item.id}>
                          <td>
                            {item.Product?.name || 'Sản phẩm đã xóa'}
                            <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                               {item.size && <span style={{marginRight: '5px'}}>Size: {item.size}</span>}
                               {item.color && <span>Màu: {item.color}</span>}
                            </div>
                          </td>
                          <td>x{item.quantity}</td>
                          <td>{Number(item.priceAtTime).toLocaleString()} ₫</td>
                          <td>{(Number(item.priceAtTime) * item.quantity).toLocaleString()} ₫</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{textAlign:'right', fontSize:'1.1rem'}}>
                  Tổng cộng: <b style={{color:'var(--primary)'}}>{Number(targetData.totalAmount).toLocaleString()} ₫</b>
                </div>
                <div style={{display:'flex', gap:10, marginTop:15}}>
                  <button className="btn btn-secondary" style={{width:'50%', background:'#3498db', color:'white', border:'none', cursor:'pointer'}} onClick={handlePrintOrder}>📄 Xuất Hóa Đơn</button>
                  <button className="btn btn-primary" style={{width:'50%'}} onClick={()=>setActiveModal(null)}>Đóng</button>
                </div>
              </div>
            )}

            {activeModal === 'applyPromo' && targetData && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const newPromoPrice = Number(discountForm.promoPrice);
                  const origPrice = Number(targetData.price);
                  
                  if (newPromoPrice <= 0 || newPromoPrice >= origPrice) return triggerToast('Giá khuyến mãi phải nhỏ hơn giá gốc và lớn hơn 0', 'error');
                  
                  await axios.put(`http://localhost:5000/api/products/${targetData.id}`, {
                    ...targetData,
                    discountPrice: newPromoPrice
                  }, { headers });
                  triggerToast('Cập nhật giá khuyến mãi thành công');
                  setActiveModal(null);
                  fetchData();
                } catch(err) { triggerToast('Lỗi', 'error'); }
              }}>
                <h3>🏷️ Khuyến mãi: {targetData.name}</h3>
                <div style={{marginTop:15}}>
                  <p style={{marginBottom:10}}>Giá gốc: <b>{Number(targetData.price).toLocaleString()} ₫</b></p>
                  <label>Giá khuyến mãi mới (₫)</label>
                  <input type="number" className="admin-input" min="0" required value={discountForm.promoPrice} onChange={e=>setDiscountForm({...discountForm, promoPrice: e.target.value})} placeholder="Nhập giá khuyến mãi" />
                  {discountForm.promoPrice > 0 && discountForm.promoPrice < (targetData.price) && (
                     <p style={{marginTop:10, color:'#e74c3c'}}>Phần trăm giảm: <b>{Math.round((1 - discountForm.promoPrice / targetData.price) * 100)}%</b></p>
                  )}
                </div>
                <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop:15}}>Lưu Khuyến Mãi</button>
                <button type="button" onClick={async () => {
                  if(!targetData.discountPrice) return setActiveModal(null);
                  try {
                    await axios.put(`http://localhost:5000/api/products/${targetData.id}`, {
                      ...targetData,
                      discountPrice: null
                    }, { headers });
                    triggerToast('Đã xóa khuyến mãi');
                    setActiveModal(null);
                    fetchData();
                  } catch(err) { triggerToast('Lỗi', 'error'); }
                }} className="btn btn-secondary" style={{width:'100%', marginTop:10, background: '#e74c3c'}}>Xóa khuyến mãi</button>
                <button type="button" onClick={()=>setActiveModal(null)} style={{width:'100%', background:'none', border:'none', marginTop:5}}>Đóng</button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="container admin-container">
        
        {/* SEPARATE SIDEBAR MENU ITEMS FOR ALL CONFIGURATIONS */}
        <div className="admin-sidebar">
          <div className={`admin-sidebar-item ${tab === 'orders' ? 'active' : ''}`} onClick={()=>setTab('orders')}><ShoppingBag size={18}/> Đơn hàng</div>
          <div className={`admin-sidebar-item ${tab === 'tx' ? 'active' : ''}`} onClick={()=>setTab('tx')}><Activity size={18}/> Lịch sử giao dịch</div>
          <div className={`admin-sidebar-item ${tab === 'products' ? 'active' : ''}`} onClick={()=>setTab('products')}><Package size={18}/> Sản phẩm</div>
          <div className={`admin-sidebar-item ${tab === 'promo' ? 'active' : ''}`} onClick={()=>setTab('promo')}><Percent size={18}/> Khuyến mãi SP</div>
          <div className={`admin-sidebar-item ${tab === 'vouchers' ? 'active' : ''}`} onClick={()=>setTab('vouchers')}><Percent size={18}/> Mã Voucher</div>
          <div className="sidebar-divider" style={{height:'1px', background:'#eee', margin:'10px 25px'}}></div>
          
          <div className={`admin-sidebar-item ${tab === 'cat' ? 'active' : ''}`} onClick={()=>setTab('cat')}><FolderOpen size={18}/> Danh mục</div>
          <div className={`admin-sidebar-item ${tab === 'type' ? 'active' : ''}`} onClick={()=>setTab('type')}><Sofa size={18}/> Loại nội thất</div>
          <div className={`admin-sidebar-item ${tab === 'style' ? 'active' : ''}`} onClick={()=>setTab('style')}><Palette size={18}/> Phong cách</div>
          <div className={`admin-sidebar-item ${tab === 'seg' ? 'active' : ''}`} onClick={()=>setTab('seg')}><Coins size={18}/> Phân khúc</div>
          
          <div className="sidebar-divider" style={{height:'1px', background:'#eee', margin:'10px 25px'}}></div>
          <div className={`admin-sidebar-item ${tab === 'users' ? 'active' : ''}`} onClick={()=>setTab('users')}><Users size={18}/> Khách hàng</div>
          <div className={`admin-sidebar-item ${tab === 'stats' ? 'active' : ''}`} onClick={()=>setTab('stats')}><TrendingUp size={18}/> Thống kê & Doanh thu</div>
          <div className={`admin-sidebar-item ${tab === 'chatlogs' ? 'active' : ''}`} onClick={() => setTab('chatlogs')} style={{ display: 'flex', alignItems: 'center' }}>
            <MessageCircle size={18} style={{ marginRight: 10 }} /> 
            <span>Chat Logs & Hỗ trợ</span>
            {supportCount > 0 && (
              <span style={{ background: '#e74c3c', color: 'white', borderRadius: '12px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700, marginLeft: 'auto' }}>
                {supportCount}
              </span>
            )}
          </div>
        </div>

        <div className="admin-card">

          {tab === 'stats' && (() => {
            const approvedOrders = orders.filter(o => o.status === 'approved');
            const totalRev = approvedOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
            const totalDeposits = allTx.filter(t => t.type === 'deposit').reduce((sum, t) => sum + Number(t.amount), 0);
            
            const sales = {};
            approvedOrders.forEach(o => {
                if (o.OrderItems) {
                    o.OrderItems.forEach(item => {
                        if(!sales[item.productId]) sales[item.productId] = { name: item.Product?.name || 'Sản phẩm đã xóa', qty: 0, rev: 0 };
                        sales[item.productId].qty += item.quantity;
                        sales[item.productId].rev += item.quantity * Number(item.priceAtTime);
                    });
                }
            });
            const topProducts = Object.values(sales).sort((a,b) => b.qty - a.qty).slice(0, 5);

            // Prepare Data for Charts
            const barData = topProducts.map(p => ({
              name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
              'Đã bán': p.qty,
              'Doanh thu': p.rev
            }));

            const statusCounts = { pending: 0, approved: 0, cancelled: 0 };
            orders.forEach(o => { if (statusCounts[o.status] !== undefined) statusCounts[o.status]++; });
            
            const pieData = [
              { name: 'Đang chờ', value: statusCounts.pending },
              { name: 'Hoàn thành', value: statusCounts.approved },
              { name: 'Đã hủy', value: statusCounts.cancelled }
            ].filter(d => d.value > 0); // Only show statuses that have orders

            const COLORS = ['#f39c12', '#27ae60', '#e74c3c'];

            return (
              <>
                <h2>📊 Bảng điều khiển Thống kê</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px', marginTop: '20px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #3498db, #2980b9)', padding: '20px', borderRadius: '10px', color: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Tổng doanh thu (Đơn hàng)</div>
                    <h3 style={{ margin: '10px 0 0', fontSize: '1.8rem' }}>{totalRev.toLocaleString()} ₫</h3>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #27ae60, #2ecc71)', padding: '20px', borderRadius: '10px', color: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Tổng tiền nạp vào (Ví)</div>
                    <h3 style={{ margin: '10px 0 0', fontSize: '1.8rem' }}>{totalDeposits.toLocaleString()} ₫</h3>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #f39c12, #f1c40f)', padding: '20px', borderRadius: '10px', color: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Đơn hàng hoàn thành</div>
                    <h3 style={{ margin: '10px 0 0', fontSize: '1.8rem' }}>{approvedOrders.length} đơn</h3>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #8e44ad, #9b59b6)', padding: '20px', borderRadius: '10px', color: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Tổng khách hàng</div>
                    <h3 style={{ margin: '10px 0 0', fontSize: '1.8rem' }}>{appUsers.length} người</h3>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--primary)', fontSize: '1.2rem' }}>Top 5 Sản phẩm bán chạy (Số lượng)</h3>
                    {barData.length > 0 ? (
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <BarChart data={barData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <XAxis dataKey="name" tick={{fontSize: 11}} />
                            <YAxis />
                            <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                            <Legend />
                            <Bar dataKey="Đã bán" fill="#3498db" radius={[4, 4, 0, 0]} barSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu đơn hàng thành công.</p>
                    )}
                  </div>

                  <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--primary)', fontSize: '1.2rem' }}>Tỉ lệ Trạng thái Đơn hàng</h3>
                    {orders.length > 0 ? (
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                       <p style={{ color: 'var(--text-muted)' }}>Chưa có đơn hàng nào.</p>
                    )}
                  </div>
                </div>

                <h3 style={{ marginBottom: '15px' }}>Bảng chi tiết doanh thu Top 5</h3>
                {topProducts.length > 0 ? (
                  <table className="admin-table" style={{ marginBottom: '20px' }}>
                    <thead>
                      <tr><th>Tên sản phẩm</th><th>Đã bán (Số lượng)</th><th>Doanh thu mang lại</th></tr>
                    </thead>
                    <tbody>
                      {topProducts.map((p, idx) => (
                        <tr key={idx}>
                          <td><b>{p.name}</b></td>
                          <td style={{ color: '#27ae60', fontWeight: 'bold' }}>{p.qty} cái</td>
                          <td>{p.rev.toLocaleString()} ₫</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu.</p>
                )}

                <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>📦 Sản phẩm mới thêm gần đây</h3>
                <table className="admin-table" style={{ marginBottom: '20px' }}>
                  <thead>
                    <tr><th>Sản phẩm</th><th>Giá bán</th><th>Tồn kho</th><th>Ngày thêm</th></tr>
                  </thead>
                  <tbody>
                    {[...products].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map(p => (
                      <tr key={p.id}>
                        <td><div style={{display:'flex', alignItems:'center', gap:10}}><img src={p.mainImage} style={{width:30,height:30,objectFit:'cover',borderRadius:4}} alt=""/> <b>{p.name}</b></div></td>
                        <td>{Number(p.price).toLocaleString()} ₫</td>
                        <td>{p.stock}</td>
                        <td>{new Date(p.createdAt).toLocaleDateString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            );
          })()}
          
          {tab === 'orders' && (
            <><h2>Đơn hàng</h2><table className="admin-table"><thead><tr><th>Mã</th><th>Người mua</th><th>Tiền</th><th>Thanh toán</th><th>Tình trạng</th><th>Xử lý</th></tr></thead><tbody>
              {orders.map(o=>(<tr key={o.id}><td>#{o.id}</td><td>{o.User?.username}</td><td>{Number(o.totalAmount).toLocaleString()}</td><td>{o.paymentMethod === 'cod' ? 'COD' : o.paymentMethod === 'bank_transfer' ? 'CK Ngân hàng' : 'Ví online'}</td><td><span className={`badge-${o.status}`}>{o.status}</span></td>
              <td><div style={{display:'flex',gap:5}}>
                <button onClick={()=>{setTargetData(o);setActiveModal('viewOrder')}} className="action-btn" style={{background:'#3498db',color:'#fff'}} title="Chi tiết"><Eye size={12}/></button>
                {o.status==='pending' && <>
                  <button onClick={()=>{setTargetData(o);setActiveModal('confirmApr')}} className="action-btn btn-approve" title="Phê duyệt"><Check size={12}/></button>
                  <button onClick={()=>{setTargetData(o);setActiveModal('confirmRej')}} className="action-btn btn-reject" title="Từ chối"><X size={12}/></button>
                </>}
              </div></td></tr>))}
            </tbody></table></>
          )}

          {tab === 'tx' && (
            <><h2>Lịch sử giao dịch (Toàn hệ thống)</h2>
            <table className="admin-table"><thead><tr><th>Mã GD</th><th>Thời gian</th><th>Khách hàng</th><th>Loại</th><th>Số tiền</th><th>Nội dung</th><th>Chi tiết</th></tr></thead><tbody>
              {allTx.map(t=>(<tr key={t.id}>
                <td>#{t.id}</td>
                <td>{new Date(t.createdAt).toLocaleString('vi-VN')}</td>
                <td><b>{t.User?.username || 'Ẩn danh'}</b><br/><small style={{color:'var(--text-muted)'}}>{t.User?.email}</small></td>
                <td><span className={`badge-${t.type==='deposit'?'paid':'pending'}`}>{t.type === 'deposit' ? 'Nạp tiền' : 'Thanh toán'}</span></td>
                <td style={{color: t.type==='deposit' ? '#27ae60' : '#e74c3c', fontWeight:600}}>
                  {t.type==='deposit'?'+':'-'}{Number(t.amount).toLocaleString()} ₫
                </td>
                <td>{t.description}</td>
                <td>
                  {t.type === 'payment' && (() => {
                    const match = t.description.match(/#(\d+)/);
                    if (match) {
                      const orderId = Number(match[1]);
                      const linkedOrder = orders.find(o => o.id === orderId);
                      if (linkedOrder) {
                        return <button onClick={()=>{setTargetData(linkedOrder);setActiveModal('viewOrder')}} className="action-btn" style={{background:'#3498db',color:'#fff', padding:'2px 5px', fontSize:'0.75rem', width:'auto'}}><Eye size={12} style={{marginRight:3, display:'inline-block'}}/> ĐH</button>
                      }
                    }
                    return null;
                  })()}
                </td>
              </tr>))}
            </tbody></table></>
          )}

          {tab === 'products' && (
            <>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                <h2>📦 Kho Sản phẩm</h2>
                <div style={{display:'flex', gap:10}}>
                  <input className="admin-input" placeholder="Tìm kiếm sản phẩm..." value={searchProd} onChange={e=>setSearchProd(e.target.value)} style={{width:250, padding:'8px 15px'}} />
                  <button className="btn btn-primary" onClick={()=>{setProdForm({name:'',price:'',stock:10,type:'',style:'',segment:'',categoryId:'',mainImage:'',description:'',detailedDescription:''}); setActiveModal('addProd')}}><Plus size={16}/> Thêm</button>
                </div>
              </div>
              <table className="admin-table"><thead><tr><th>Sản phẩm</th><th>Phân loại</th><th>Phong cách</th><th>Phân khúc</th><th>Kho</th><th>Xử lý</th></tr></thead><tbody>
                {products.filter(p => removeDiacritics(p.name).includes(removeDiacritics(searchProd))).map(p=>(<tr key={p.id}>
                <td><div style={{display:'flex', alignItems:'center', gap:10}}><img src={p.mainImage} style={{width:40,height:40,objectFit:'cover',borderRadius:5}} alt="img"/> <b>{p.name}</b></div></td>
                <td><small>{p.type} <br/><span style={{color:'var(--primary)'}}>{p.room}</span></small></td>
                <td><small>{p.style}</small></td>
                <td><small>{p.segment}</small></td>
                <td>{p.stock}</td>
                <td><div style={{display:'flex',gap:10}}><Edit2 size={16} color="#3498db" style={{cursor:'pointer'}} onClick={()=>{setTargetData(p); setProdForm({...p}); setActiveModal('editProd');}}/>
                <Trash size={16} color="#e74c3c" style={{cursor:'pointer'}} onClick={()=>{setTargetData(p);setActiveModal('confirmDelPrd')}}/></div></td></tr>))}
              </tbody></table>
            </>
          )}

          {tab === 'promo' && (
            <>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                <h2>🏷️ Quản lý Khuyến mãi</h2>
                <input className="admin-input" placeholder="Tìm kiếm sản phẩm..." value={searchProd} onChange={e=>setSearchProd(e.target.value)} style={{width:250, padding:'8px 15px'}} />
              </div>
              <table className="admin-table">
                <thead><tr><th>Sản phẩm</th><th>Giá gốc</th><th>Giá hiện tại</th><th>Khuyến mãi</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {products.filter(p => removeDiacritics(p.name).includes(removeDiacritics(searchProd))).map(p=>(
                    <tr key={p.id}>
                      <td><div style={{display:'flex', alignItems:'center', gap:10}}><img src={p.mainImage} style={{width:40,height:40,objectFit:'cover',borderRadius:5}} alt="img"/> <b>{p.name}</b></div></td>
                      <td>{Number(p.price).toLocaleString()} ₫</td>
                      <td><b style={{color: p.discountPrice ? '#e74c3c' : 'inherit'}}>{p.discountPrice ? Number(p.discountPrice).toLocaleString() : '-'} ₫</b></td>
                      <td>
                        {p.discountPrice ? (
                          <span className="badge-paid">-{Math.round((1 - p.discountPrice / p.price) * 100)}%</span>
                        ) : (
                          <span style={{color: 'var(--text-muted)'}}>Không</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-primary" style={{padding: '5px 10px', fontSize: '0.8rem'}} onClick={()=>{setTargetData(p); setDiscountForm({promoPrice: p.discountPrice || ''}); setActiveModal('applyPromo');}}>{p.discountPrice ? 'Sửa KM' : 'Thêm KM'}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {tab === 'vouchers' && (
            <>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                <h2>🎟️ Quản lý Voucher (Mã giảm giá)</h2>
                <button className="btn btn-primary" onClick={()=>{setVoucherForm({code:'',discountPercent:'',maxDiscount:'',minOrderValue:'',usageLimit:100,oncePerUser:true,startDate:'',endDate:''}); setActiveModal('addVoucher')}}><Plus size={16}/> Thêm mã mới</button>
              </div>
              <table className="admin-table">
                <thead><tr><th>Mã Code</th><th>Giảm %</th><th>Giảm Tối Đa</th><th>Đơn Tối Thiểu</th><th>Đã Dùng / Giới Hạn</th><th>Giới hạn User</th><th>Thời hạn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {vouchers.map(v=>(
                    <tr key={v.id}>
                      <td><b style={{color: 'var(--primary)', padding: '4px 8px', background: '#eef5ff', borderRadius: '5px'}}>{v.code}</b></td>
                      <td><b>{v.discountPercent}%</b></td>
                      <td>{v.maxDiscount ? Number(v.maxDiscount).toLocaleString() + ' ₫' : 'Không giới hạn'}</td>
                      <td>{Number(v.minOrderValue).toLocaleString()} ₫</td>
                      <td>{v.usedCount} / {v.usageLimit}</td>
                      <td>{v.oncePerUser ? <span style={{color: '#e67e22', fontWeight: 'bold'}}>Mỗi người 1 lần</span> : <span style={{color: '#7f8c8d'}}>Không giới hạn</span>}</td>
                      <td>
                        <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                          <div><b>Từ:</b> {v.startDate ? new Date(v.startDate).toLocaleString('vi-VN') : 'Ngay lập tức'}</div>
                          <div><b>Đến:</b> {v.endDate ? new Date(v.endDate).toLocaleString('vi-VN') : 'Vô thời hạn'}</div>
                        </div>
                      </td>
                      <td>
                        {v.isActive && v.usedCount < v.usageLimit ? (
                          <span className="badge-paid">Đang chạy</span>
                        ) : (
                          <span className="badge-cancelled">Hết hạn/Hết lượt</span>
                        )}
                      </td>
                      <td>
                        <Trash size={16} color="#e74c3c" style={{cursor:'pointer'}} onClick={()=>deleteVoucher(v.id)}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* SEPARATE INDEPENDENT TABS FOR EACH ENTITY */}

          {tab === 'cat' && (
            <>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}><h2>📁 Quản lý Danh mục</h2><button className="btn btn-primary" onClick={()=>setActiveModal('addCat')}>+ Thêm mới</button></div>
              <table className="admin-table"><thead><tr><th>Tên</th><th>⚙️</th></tr></thead><tbody>
                {categories.map(c=>(<tr key={c.id}><td><b>{c.name}</b></td><td><Trash size={16} color="#e74c3c" style={{cursor:'pointer'}} onClick={async ()=>{await axios.delete(`http://localhost:5000/api/categories/${c.id}`,{headers}); triggerToast('Đã xóa'); fetchData();}}/></td></tr>))}
              </tbody></table>
            </>
          )}

          {tab === 'type' && (
            <>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}><h2>🛋️ Quản lý Loại Nội Thất</h2><button className="btn btn-primary" onClick={()=>{setGenericAttrForm(''); setActiveModal('addAttrType')}}>+ Thêm Loại</button></div>
              <table className="admin-table"><thead><tr><th>ID</th><th>Tên Loại Nội Thất</th><th>Xóa</th></tr></thead><tbody>
                {typeOpts.map(t=>(<tr key={t.id}><td>#{t.id}</td><td style={{fontWeight:600}}>{t.name}</td><td><Trash size={16} color="#e74c3c" style={{cursor:'pointer'}} onClick={()=>deleteAttribute(t.id, 'type')}/></td></tr>))}
              </tbody></table>
            </>
          )}

          {tab === 'style' && (
            <>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}><h2>🎨 Quản lý Phong Cách</h2><button className="btn btn-primary" onClick={()=>{setGenericAttrForm(''); setActiveModal('addAttrStyle')}}>+ Thêm Phong Cách</button></div>
              <table className="admin-table"><thead><tr><th>ID</th><th>Tên Phong Cách</th><th>Xóa</th></tr></thead><tbody>
                {styleOpts.map(s=>(<tr key={s.id}><td>#{s.id}</td><td style={{fontWeight:600}}>{s.name}</td><td><Trash size={16} color="#e74c3c" style={{cursor:'pointer'}} onClick={()=>deleteAttribute(s.id, 'style')}/></td></tr>))}
              </tbody></table>
            </>
          )}

          {tab === 'seg' && (
            <>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}><h2>💰 Quản lý Phân Khúc Giá</h2><button className="btn btn-primary" onClick={()=>{setGenericAttrForm(''); setActiveModal('addAttrSeg')}}>+ Thêm Phân Khúc</button></div>
              <table className="admin-table"><thead><tr><th>ID</th><th>Tên Phân Khúc</th><th>Xóa</th></tr></thead><tbody>
                {segOpts.map(s=>(<tr key={s.id}><td>#{s.id}</td><td style={{fontWeight:600}}>{s.name}</td><td><Trash size={16} color="#e74c3c" style={{cursor:'pointer'}} onClick={()=>deleteAttribute(s.id, 'segment')}/></td></tr>))}
              </tbody></table>
            </>
          )}

          {tab === 'users' && (
            <><h2>👥 Khách hàng</h2><table className="admin-table"><thead><tr><th>Tên</th><th>Email</th><th>Số dư</th><th>Trạng thái</th><th>Chi tiết phạt</th><th>Thao tác</th></tr></thead><tbody>
              {appUsers.map(u=>(<tr key={u.id}><td>{u.username}</td><td>{u.email}</td><td style={{color:'#27ae60',fontWeight:700}}>{Number(u.balance).toLocaleString()} ₫</td>
              <td>{u.isBlocked ? <span className="badge-cancelled">Bị khóa</span> : <span className="badge-approved">Hoạt động</span>}</td>
              <td style={{color:'#e74c3c', fontSize:'0.85rem'}}>
                {u.blockReason ? <div><b>Lý do:</b> {u.blockReason}</div> : ''}
                {u.blockExpiresAt ? <div><b>Đến:</b> {new Date(u.blockExpiresAt).toLocaleString('vi-VN')}</div> : (u.isBlocked ? <div><b>Vĩnh viễn</b></div> : '')}
              </td>
              <td>
                <button onClick={()=>{setTargetData(u); setBlockReasonForm(''); setBlockExpiresAtForm(''); if(!u.isBlocked) setActiveModal('blockUser'); else processBlock(u.id, '', null);}} className="action-btn" style={{background:u.isBlocked?'#27ae60':'#e74c3c',color:'#fff', padding:'5px 10px', fontSize:'0.8rem', width:'auto'}}>{u.isBlocked?'Mở khóa':'Khóa tài khoản'}</button>
              </td></tr>))}
            </tbody></table></>
          )}

          {tab === 'chatlogs' && (() => {
            // Nhóm dữ liệu chat theo sessionId
            const sessions = [];
            const sessionMap = {};
            chatLogs.forEach(log => {
              if (!sessionMap[log.sessionId]) {
                sessionMap[log.sessionId] = {
                  sessionId: log.sessionId,
                  user: null, // Sẽ gán user thật từ các tin nhắn của khách
                  latestMessage: log.message,
                  latestRole: log.role,
                  updatedAt: log.createdAt,
                  messages: []
                };
                sessions.push(sessionMap[log.sessionId]);
              }
              // Tìm User thực sự của phiên (tránh lấy nhầm Admin)
              if ((log.role === 'user' || log.role === 'user_support') && log.User && !sessionMap[log.sessionId].user) {
                sessionMap[log.sessionId].user = log.User;
              }
              // Thêm tin nhắn vào đầu mảng vì chatLogs đang sắp xếp DESC
              sessionMap[log.sessionId].messages.unshift(log); 
            });

            return (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h2>💬 Quản lý Hỗ trợ Khách hàng (Live Chat)</h2>
                </div>
                
                <div style={{ 
                  display: 'flex', height: '600px', background: '#fff', 
                  borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid #e1e8ed'
                }}>
                  {/* Cột trái: Danh sách Session */}
                  <div style={{ 
                    width: '320px', borderRight: '1px solid #e1e8ed', 
                    display: 'flex', flexDirection: 'column', background: '#f8f9fa' 
                  }}>
                    <div style={{ padding: '15px 20px', borderBottom: '1px solid #e1e8ed', fontWeight: 700, fontSize: '1.1rem', background: '#fff' }}>
                      Đoạn hội thoại ({sessions.length})
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      {sessions.map(s => {
                        const displayName = s.user ? s.user.username : `Khách vãng lai ${s.sessionId.substring(5, 10)}`;
                        const isUnreadSupport = s.latestRole === 'user_support' && s.sessionId !== replySessionId && !readSessions.has(s.sessionId);
                        return (
                          <div 
                            key={s.sessionId} 
                            onClick={() => handleSelectSession(s.sessionId)}
                            style={{ 
                              padding: '15px 20px', borderBottom: '1px solid #e1e8ed', cursor: 'pointer', 
                              background: replySessionId === s.sessionId ? '#e3f2fd' : '#fff',
                              borderLeft: replySessionId === s.sessionId ? '4px solid var(--primary)' : '4px solid transparent',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                              <strong style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                {displayName}
                                {isUnreadSupport && (
                                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e74c3c', display: 'inline-block' }} title="Cần hỗ trợ"></span>
                                )}
                              </strong>
                              <span style={{ fontSize: '0.75rem', color: '#888' }}>
                                {new Date(s.updatedAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {s.latestMessage}
                            </div>
                          </div>
                        )
                      })}
                      {sessions.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#888' }}>Không có cuộc trò chuyện nào</div>}
                    </div>
                  </div>

                  {/* Cột phải: Nội dung Chat */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
                    {replySessionId && sessionMap[replySessionId] ? (
                      <>
                        {/* Chat Header */}
                        <div style={{ padding: '15px 25px', borderBottom: '1px solid #e1e8ed', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {sessionMap[replySessionId].user ? sessionMap[replySessionId].user.username.charAt(0).toUpperCase() : 'K'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{sessionMap[replySessionId].user ? sessionMap[replySessionId].user.username : 'Khách vãng lai'}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>Phiên: {replySessionId}</div>
                          </div>
                        </div>

                        {/* Chat Body */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px', background: '#f5f6fa' }}>
                          {sessionMap[replySessionId].messages.map(msg => (
                            <div key={msg.id} style={{ 
                              alignSelf: msg.role === 'admin' ? 'flex-end' : 'flex-start', 
                              maxWidth: '75%' 
                            }}>
                              <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '4px', textAlign: msg.role === 'admin' ? 'right' : 'left', fontWeight: 500 }}>
                                {(msg.role === 'user' || msg.role === 'user_support') ? 'Khách hàng' : msg.role === 'model' ? '🤖 AI Assistant' : '👨‍💼 Bạn (Nhân viên)'} • {new Date(msg.createdAt).toLocaleTimeString('vi-VN')}
                              </div>
                              <div style={{ 
                                padding: '12px 16px', borderRadius: '16px', 
                                background: msg.role === 'admin' ? 'var(--primary)' : msg.role === 'model' ? '#e1f5fe' : '#fff', 
                                color: msg.role === 'admin' ? '#fff' : '#333',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                borderTopRightRadius: msg.role === 'admin' ? '4px' : '16px',
                                borderTopLeftRadius: msg.role !== 'admin' ? '4px' : '16px',
                                lineHeight: 1.5
                              }}>
                                {msg.message.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}
                                <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: 4, textAlign: 'right' }}>
                                  {msg.role === 'admin' ? '✓ Đã gửi' : '✓✓ Đã nhận'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Chat Input */}
                        <div style={{ padding: '20px', borderTop: '1px solid #e1e8ed', background: '#fff' }}>
                          <form onSubmit={handleAdminReply} style={{ display: 'flex', gap: '10px' }}>
                            <input 
                              type="text" 
                              autoFocus
                              className="admin-input" 
                              style={{ flex: 1, borderRadius: '24px', padding: '12px 20px' }} 
                              placeholder="Nhập tin nhắn trả lời khách hàng..." 
                              value={replyMessage} 
                              onChange={e => setReplyMessage(e.target.value)} 
                            />
                            <button type="submit" className="btn btn-primary" style={{ borderRadius: '24px', padding: '0 25px', display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Send size={18}/> Gửi
                            </button>
                          </form>
                        </div>
                      </>
                    ) : (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                        <MessageCircle size={64} style={{ opacity: 0.2, marginBottom: 20 }} />
                        <h3>Chọn một cuộc trò chuyện</h3>
                        <p>Bấm vào danh sách bên trái để xem và trả lời khách hàng</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
