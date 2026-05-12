import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, CheckCircle } from 'lucide-react';

const Address = () => {
  const { token } = useAuth();
  const [addr, setAddr] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddr(res.data.address || '');
    };
    if(token) fetch();
  }, [token]);

  const save = async () => {
    await axios.put('http://localhost:5000/api/users/profile', { address: addr }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMsg('Cập nhật địa chỉ thành công!');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div style={{ paddingTop: '120px', minHeight: '80vh' }} className="container">
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '20px', boxShadow: 'var(--shadow-md)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}><MapPin color="var(--secondary)" /> Địa chỉ mặc định</h3>
        {msg && <div style={{ background: '#e8f6ec', color: '#27ae60', padding: '10px', marginBottom: '15px', borderRadius: '5px' }}>{msg}</div>}
        <textarea 
          placeholder="Nhập địa chỉ nhận hàng chi tiết của bạn..."
          style={{ width: '100%', minHeight: '120px', padding: '15px', borderRadius: '10px', border: '2px solid #eee', resize: 'none', fontSize: '1rem', marginBottom: '20px' }}
          value={addr}
          onChange={e => setAddr(e.target.value)}
        />
        <button className="btn-add-to-cart" style={{ width: '100%', justifyContent: 'center' }} onClick={save}>
          <CheckCircle size={18} /> Lưu địa chỉ
        </button>
      </div>
    </div>
  );
};

export default Address;
