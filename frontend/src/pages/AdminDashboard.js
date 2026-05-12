import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Package, Users, Check, X, Trash, Plus, Edit2, AlertCircle, CheckCircle2, FolderOpen, Sofa, Palette, Coins } from 'lucide-react';

const AdminDashboard = () => {
  const { token, user } = useAuth();
  const [tab, setTab] = useState('orders');
  
  // Master Data
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [appUsers, setAppUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);

  // Real-time Filtered Attribute Sets
  const typeOpts = attributes.filter(a => a.group === 'type');
  const styleOpts = attributes.filter(a => a.group === 'style');
  const segOpts = attributes.filter(a => a.group === 'segment');

  // Interaction states
  const [activeModal, setActiveModal] = useState(null); 
  const [targetData, setTargetData] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  // Form Bindings
  const [prodForm, setProdForm] = useState({ name: '', price: '', stock: 10, type: '', style: '', segment: '', mainImage: '', categoryId: '' });
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [genericAttrForm, setGenericAttrForm] = useState(''); // simplified string name

  const headers = { Authorization: `Bearer ${token}` };
  const triggerToast = (msg, type='success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type }), 3000);
  };

  const fetchData = async () => {
    try {
      const [o, p, u, c, a] = await Promise.all([
        axios.get('http://localhost:5000/api/orders', { headers }),
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/users', { headers }),
        axios.get('http://localhost:5000/api/categories'),
        axios.get('http://localhost:5000/api/attributes')
      ]);
      setOrders(o.data); setProducts(p.data); setAppUsers(u.data); setCategories(c.data); setAttributes(a.data);
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
      await axios.post('http://localhost:5000/api/attributes', { group, name: genericAttrForm }, { headers });
      triggerToast(`Thêm ${genericAttrForm} thành công!`);
      setGenericAttrForm('');
      setActiveModal(null);
      fetchData();
    } catch(e) { triggerToast('Lỗi thêm!', 'error'); }
  };

  const deleteAttribute = async (id) => {
    try { await axios.delete(`http://localhost:5000/api/attributes/${id}`, { headers }); triggerToast('Đã xóa'); fetchData(); }
    catch(e) { triggerToast('Lỗi', 'error'); }
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
          <div className="custom-modal-content" style={{maxWidth: activeModal.includes('Prod') ? '600px' : '400px'}}>
            
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
                <textarea className="admin-input" placeholder="Mô tả" onChange={e=>setCatForm({...catForm, description:e.target.value})}/>
                <button type="submit" className="btn btn-primary" style={{width:'100%'}}>Xác nhận</button>
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

          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="container admin-container">
        
        {/* SEPARATE SIDEBAR MENU ITEMS FOR ALL CONFIGURATIONS */}
        <div className="admin-sidebar">
          <div className={`admin-sidebar-item ${tab === 'orders' ? 'active' : ''}`} onClick={()=>setTab('orders')}><ShoppingBag size={18}/> Đơn hàng</div>
          <div className={`admin-sidebar-item ${tab === 'products' ? 'active' : ''}`} onClick={()=>setTab('products')}><Package size={18}/> Sản phẩm</div>
          <div className="sidebar-divider" style={{height:'1px', background:'#eee', margin:'10px 25px'}}></div>
          
          <div className={`admin-sidebar-item ${tab === 'cat' ? 'active' : ''}`} onClick={()=>setTab('cat')}><FolderOpen size={18}/> Danh mục</div>
          <div className={`admin-sidebar-item ${tab === 'type' ? 'active' : ''}`} onClick={()=>setTab('type')}><Sofa size={18}/> Loại nội thất</div>
          <div className={`admin-sidebar-item ${tab === 'style' ? 'active' : ''}`} onClick={()=>setTab('style')}><Palette size={18}/> Phong cách</div>
          <div className={`admin-sidebar-item ${tab === 'seg' ? 'active' : ''}`} onClick={()=>setTab('seg')}><Coins size={18}/> Phân khúc</div>
          
          <div className="sidebar-divider" style={{height:'1px', background:'#eee', margin:'10px 25px'}}></div>
          <div className={`admin-sidebar-item ${tab === 'users' ? 'active' : ''}`} onClick={()=>setTab('users')}><Users size={18}/> Khách hàng</div>
        </div>

        <div className="admin-card">
          
          {tab === 'orders' && (
            <><h2>Đơn hàng</h2><table className="admin-table"><thead><tr><th>Mã</th><th>Người mua</th><th>Tiền</th><th>Tình trạng</th><th>Xử lý</th></tr></thead><tbody>
              {orders.map(o=>(<tr key={o.id}><td>#{o.id}</td><td>{o.User?.username}</td><td>{Number(o.totalAmount).toLocaleString()}</td><td><span className={`badge-${o.status}`}>{o.status}</span></td>
              <td>{o.status==='pending' && <div style={{display:'flex',gap:5}}>
                <button onClick={()=>{setTargetData(o);setActiveModal('confirmApr')}} className="action-btn btn-approve"><Check size={12}/></button>
                <button onClick={()=>{setTargetData(o);setActiveModal('confirmRej')}} className="action-btn btn-reject"><X size={12}/></button>
              </div>}</td></tr>))}
            </tbody></table></>
          )}

          {tab === 'products' && (
            <>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2>📦 Kho Sản phẩm</h2>
              <button className="btn btn-primary" onClick={()=>{setProdForm({name:'',price:'',stock:10,type:'',style:'',segment:'',categoryId:'',mainImage:''}); setActiveModal('addProd')}}><Plus size={16}/> Thêm</button></div>
              <table className="admin-table"><thead><tr><th>SP</th><th>Phân loại</th><th>Kho</th><th></th></tr></thead><tbody>
                {products.map(p=>(<tr key={p.id}><td>{p.name}</td><td><small>{p.type} | {p.room}</small></td><td>{p.stock}</td>
                <td><div style={{display:'flex',gap:10}}><Edit2 size={16} color="#3498db" style={{cursor:'pointer'}} onClick={()=>{setTargetData(p); setProdForm({...p}); setActiveModal('editProd');}}/>
                <Trash size={16} color="#e74c3c" style={{cursor:'pointer'}} onClick={()=>{setTargetData(p);setActiveModal('confirmDelPrd')}}/></div></td></tr>))}
              </tbody></table>
            </>
          )}

          {/* SEPARATE INDEPENDENT TABS FOR EACH ENTITY */}

          {tab === 'cat' && (
            <>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}><h2>📁 Quản lý Danh mục</h2><button className="btn btn-primary" onClick={()=>setActiveModal('addCat')}>+ Thêm mới</button></div>
              <table className="admin-table"><thead><tr><th>Tên</th><th>Mô tả</th><th>⚙️</th></tr></thead><tbody>
                {categories.map(c=>(<tr key={c.id}><td><b>{c.name}</b></td><td>{c.description}</td><td><Trash size={16} color="#e74c3c" style={{cursor:'pointer'}} onClick={async ()=>{await axios.delete(`http://localhost:5000/api/categories/${c.id}`,{headers}); triggerToast('Đã xóa'); fetchData();}}/></td></tr>))}
              </tbody></table>
            </>
          )}

          {tab === 'type' && (
            <>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}><h2>🛋️ Quản lý Loại Nội Thất</h2><button className="btn btn-primary" onClick={()=>{setGenericAttrForm(''); setActiveModal('addAttrType')}}>+ Thêm Loại</button></div>
              <table className="admin-table"><thead><tr><th>ID</th><th>Tên Loại Nội Thất</th><th>Xóa</th></tr></thead><tbody>
                {typeOpts.map(t=>(<tr key={t.id}><td>#{t.id}</td><td style={{fontWeight:600}}>{t.name}</td><td><Trash size={16} color="#e74c3c" style={{cursor:'pointer'}} onClick={()=>deleteAttribute(t.id)}/></td></tr>))}
              </tbody></table>
            </>
          )}

          {tab === 'style' && (
            <>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}><h2>🎨 Quản lý Phong Cách</h2><button className="btn btn-primary" onClick={()=>{setGenericAttrForm(''); setActiveModal('addAttrStyle')}}>+ Thêm Phong Cách</button></div>
              <table className="admin-table"><thead><tr><th>ID</th><th>Tên Phong Cách</th><th>Xóa</th></tr></thead><tbody>
                {styleOpts.map(s=>(<tr key={s.id}><td>#{s.id}</td><td style={{fontWeight:600}}>{s.name}</td><td><Trash size={16} color="#e74c3c" style={{cursor:'pointer'}} onClick={()=>deleteAttribute(s.id)}/></td></tr>))}
              </tbody></table>
            </>
          )}

          {tab === 'seg' && (
            <>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}><h2>💰 Quản lý Phân Khúc Giá</h2><button className="btn btn-primary" onClick={()=>{setGenericAttrForm(''); setActiveModal('addAttrSeg')}}>+ Thêm Phân Khúc</button></div>
              <table className="admin-table"><thead><tr><th>ID</th><th>Tên Phân Khúc</th><th>Xóa</th></tr></thead><tbody>
                {segOpts.map(s=>(<tr key={s.id}><td>#{s.id}</td><td style={{fontWeight:600}}>{s.name}</td><td><Trash size={16} color="#e74c3c" style={{cursor:'pointer'}} onClick={()=>deleteAttribute(s.id)}/></td></tr>))}
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
