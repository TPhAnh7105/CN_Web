import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Save, Mail } from 'lucide-react';

const Profile = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState({ username: '', email: '', address: '', birthDate: '' });
  const [msg, setMsg] = useState('');
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    };
    if(token) fetch();
  }, [token]);

  const save = async () => {
    try {
      await axios.put('http://localhost:5000/api/users/profile', { 
        username: profile.username,
        birthDate: profile.birthDate,
        address: profile.address
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg('Đã lưu thay đổi thành công!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg('Lỗi cập nhật.'); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      return;
    }
    try {
      const res = await axios.put('http://localhost:5000/api/users/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPwdMsg({ type: 'success', text: res.data.message || 'Đổi mật khẩu thành công!' });
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwdMsg({ type: '', text: '' }), 3000);
    } catch (e) {
      setPwdMsg({ type: 'error', text: e.response?.data?.message || 'Có lỗi xảy ra' });
    }
  };

  return (
    <div style={{ paddingTop: '120px', minHeight: '80vh' }} className="container">
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '20px', boxShadow: 'var(--shadow-md)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}><User color="var(--secondary)" /> Hồ sơ cá nhân</h2>
        
        {msg && <div style={{ background: '#e8f6ec', color: '#27ae60', padding: '10px', marginBottom: '20px', borderRadius: '8px' }}>{msg}</div>}

        <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px' }}>Email đăng nhập</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f5f5f5', padding: '15px', borderRadius: '10px', marginBottom: '20px', color: '#888' }}>
          <Mail size={18} /> <span>{profile.email}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px' }}>Họ và Tên</label>
            <input 
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem' }} 
              value={profile.username || ''} 
              onChange={e => setProfile({...profile, username: e.target.value})} 
            />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px' }}>Ngày sinh</label>
            <input 
              type="date"
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem' }} 
              value={profile.birthDate || ''} 
              onChange={e => setProfile({...profile, birthDate: e.target.value})} 
            />
          </div>
        </div>

        <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px' }}>Địa chỉ giao hàng</label>
        <textarea 
          style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '30px', fontSize: '1rem', minHeight: '100px', resize: 'none' }} 
          value={profile.address || ''} 
          onChange={e => setProfile({...profile, address: e.target.value})} 
          placeholder="Điền địa chỉ của bạn..."
        />

        <button className="btn-add-to-cart" style={{ width: '100%', justifyContent: 'center' }} onClick={save}>
          <Save size={18} /> Lưu thông tin
        </button>

        <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Đổi Mật Khẩu</h3>
          
          {pwdMsg.text && (
            <div style={{ background: pwdMsg.type === 'success' ? '#e8f6ec' : '#fdecea', color: pwdMsg.type === 'success' ? '#27ae60' : '#e74c3c', padding: '10px', marginBottom: '20px', borderRadius: '8px' }}>
              {pwdMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px' }}>Mật khẩu hiện tại</label>
              <input type="password" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem' }} value={pwdForm.currentPassword} onChange={e => setPwdForm({...pwdForm, currentPassword: e.target.value})} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px' }}>Mật khẩu mới</label>
                <input type="password" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem' }} value={pwdForm.newPassword} onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})} required minLength="6" />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px' }}>Xác nhận mật khẩu</label>
                <input type="password" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem' }} value={pwdForm.confirmPassword} onChange={e => setPwdForm({...pwdForm, confirmPassword: e.target.value})} required minLength="6" />
              </div>
            </div>
            <button type="submit" className="btn-add-to-cart" style={{ width: '100%', justifyContent: 'center', background: 'var(--secondary)' }}>
              Đổi mật khẩu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
