import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Package, Users, Check, X, Trash, Plus, Edit2, AlertCircle, CheckCircle2, FolderOpen, Sofa, Palette, Coins, Activity, Eye, Percent, TrendingUp } from 'lucide-react';

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
  const [genericAttrForm, setGenericAttrForm] = useState(''); // simplified string name
  const [discountForm, setDiscountForm] = useState({ promoPrice: '' });
  const [searchProd, setSearchProd] = useState('');
  const [voucherForm, setVoucherForm] = useState({ code: '', discountPercent: '', maxDiscount: '', minOrderValue: '', usageLimit: 100 });

  const headers = { Authorization: `Bearer ${token}` };
  const triggerToast = (msg, type='success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type }), 3000);
  };

  const fetchData = async () => {
    try {
      const [o, p, u, c, a, t, s, tx] = await Promise.all([
        axios.get('http://localhost:5000/api/orders', { headers }),
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/users', { headers }),
        axios.get('http://localhost:5000/api/categories'),
        axios.get('http://localhost:5000/api/segments'),
        axios.get('http://localhost:5000/api/types'),
        axios.get('http://localhost:5000/api/styles'),
        axios.get('http://localhost:5000/api/users/all-transactions', { headers }),
        axios.get('http://localhost:5000/api/vouchers', { headers })
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
    } catch (e) {}
  };

  useEffect(() => { if(token) fetchData(); }, [token]);

  // Handlers
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

  if (!user || user.role !== 'admin') return <div style={{paddingTop:'150px',textAlign:'center'}}>Từ chối.</div>;

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
                  <div style={{gridColumn:'1/-1'}}><label>Ảnh</label><input className="admin-input" value={prodForm.mainImage} onChange={e=>setProdForm({...prodForm, mainImage:e.target.value})}/></div>
                </div>
                <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop:10}}>💾 Lưu</button>
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
                          <td>{item.Product?.name || 'Sản phẩm đã xóa'}</td>
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
                <button className="btn btn-primary" style={{width:'100%', marginTop:15}} onClick={()=>setActiveModal(null)}>Đóng</button>
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

            return (
              <>
                <h2>📊 Bảng điều khiển Thống kê</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px', marginTop: '20px' }}>
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

                <h3>🔥 Top 5 Sản phẩm bán chạy nhất</h3>
                {topProducts.length > 0 ? (
                  <table className="admin-table" style={{ marginTop: '15px' }}>
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
                  <p style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu đơn hàng thành công.</p>
                )}
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
                  <button className="btn btn-primary" onClick={()=>{setProdForm({name:'',price:'',stock:10,type:'',style:'',segment:'',categoryId:'',mainImage:''}); setActiveModal('addProd')}}><Plus size={16}/> Thêm</button>
                </div>
              </div>
              <table className="admin-table"><thead><tr><th>Sản phẩm</th><th>Phân loại</th><th>Phong cách</th><th>Phân khúc</th><th>Kho</th><th>Xử lý</th></tr></thead><tbody>
                {products.filter(p => p.name.toLowerCase().includes(searchProd.toLowerCase())).map(p=>(<tr key={p.id}>
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
                  {products.filter(p => p.name.toLowerCase().includes(searchProd.toLowerCase())).map(p=>(
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
                <button className="btn btn-primary" onClick={()=>{setVoucherForm({code:'',discountPercent:'',maxDiscount:'',minOrderValue:'',usageLimit:100}); setActiveModal('addVoucher')}}><Plus size={16}/> Thêm mã mới</button>
              </div>
              <table className="admin-table">
                <thead><tr><th>Mã Code</th><th>Giảm %</th><th>Giảm Tối Đa</th><th>Đơn Tối Thiểu</th><th>Đã Dùng / Giới Hạn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {vouchers.map(v=>(
                    <tr key={v.id}>
                      <td><b style={{color: 'var(--primary)', padding: '4px 8px', background: '#eef5ff', borderRadius: '5px'}}>{v.code}</b></td>
                      <td><b>{v.discountPercent}%</b></td>
                      <td>{v.maxDiscount ? Number(v.maxDiscount).toLocaleString() + ' ₫' : 'Không giới hạn'}</td>
                      <td>{Number(v.minOrderValue).toLocaleString()} ₫</td>
                      <td>{v.usedCount} / {v.usageLimit}</td>
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
            <><h2>👥 Khách hàng</h2><table className="admin-table"><thead><tr><th>Tên</th><th>Email</th><th>Số dư</th></tr></thead><tbody>
              {appUsers.map(u=>(<tr key={u.id}><td>{u.username}</td><td>{u.email}</td><td style={{color:'#27ae60',fontWeight:700}}>{Number(u.balance).toLocaleString()} ₫</td></tr>))}
            </tbody></table></>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
