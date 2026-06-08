import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Save, Mail } from 'lucide-react';

const Profile = () => {
  const { token, updateToken } = useAuth();
  const [profile, setProfile] = useState({ username: '', email: '', address: '', birthDate: '' });
  const [msg, setMsg] = useState('');
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

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

  useEffect(() => {
    const initAddressData = async () => {
      try {
        const provRes = await axios.get('https://provinces.open-api.vn/api/p/');
        setProvinces(provRes.data);
        
        if (token) {
          const res = await axios.get('http://localhost:5000/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const fetchedProfile = res.data;
          setProfile(fetchedProfile);
          
          if (fetchedProfile.address) {
            const parsed = parseAddress(fetchedProfile.address);
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
        console.error("Error initializing address data", err);
      }
    };
    initAddressData();
  }, [token]);

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

  const save = async () => {
    let finalAddress = '';
    if (selectedProv && selectedDist && selectedWard) {
      finalAddress = `${specificAddr.trim()}, ${selectedWard}, ${selectedDist}, ${selectedProv}`;
    } else {
      finalAddress = specificAddr.trim();
    }

    try {
      const res = await axios.put('http://localhost:5000/api/users/profile', { 
        username: profile.username,
        birthDate: profile.birthDate,
        address: finalAddress
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile({ ...profile, address: finalAddress });
      if (res.data.token) {
        updateToken(res.data.token);
      }
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
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Tỉnh/Thành phố</label>
            <select 
              value={provCode} 
              onChange={handleProvinceChange}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', outline: 'none' }}
            >
              <option value="">-- Chọn Tỉnh/Thành --</option>
              {provinces.map(p => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Quận/Huyện</label>
            <select 
              value={distCode} 
              onChange={handleDistrictChange}
              disabled={!provCode}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', outline: 'none', background: !provCode ? '#f5f5f5' : '#fff' }}
            >
              <option value="">-- Chọn Quận/Huyện --</option>
              {districts.map(d => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Phường/Xã</label>
            <select 
              value={wardCode} 
              onChange={handleWardChange}
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

        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Địa chỉ cụ thể (Số nhà, đường...)</label>
        <textarea 
          style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '30px', fontSize: '1rem', minHeight: '80px', resize: 'none' }} 
          value={specificAddr} 
          onChange={e => setSpecificAddr(e.target.value)} 
          placeholder="Số nhà, ngõ, tên đường..."
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
