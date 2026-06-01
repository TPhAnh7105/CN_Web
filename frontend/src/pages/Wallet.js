import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PlusCircle } from 'lucide-react';

const WalletPage = () => {
  const { token } = useAuth();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState('');

  const fetch = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalance(res.data.balance);
    } catch (err) {
      console.error("Error fetching wallet", err);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if(token) fetch(); }, [token]);

  const handleDeposit = async () => {
    if(!amount || amount <= 0) return;
    try {
      await axios.post('http://localhost:5000/api/users/deposit', { amount }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg('Nạp tiền thành công!');
      setAmount('');
      fetch();
    } catch (e) { setMsg('Thất bại.'); }
  };

  return (
    <div style={{ paddingTop: '120px', minHeight: '80vh' }} className="container">
      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'grid', gap: '20px' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary), #2c3e50)', padding: '40px', borderRadius: '20px', color: 'white', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ opacity: 0.8 }}>Số dư hiện tại</div>
          <h1 style={{ fontSize: '2.5rem', marginTop: '10px' }}>{Number(balance).toLocaleString('vi-VN')} ₫</h1>
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><PlusCircle color="var(--secondary)" /> Nạp thêm tiền</h3>
          {msg && <div style={{ color: '#27ae60', marginBottom: '15px' }}>{msg}</div>}
          <input 
            type="number" 
            placeholder="Nhập số tiền (VNĐ)" 
            style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '2px solid #eee', marginBottom: '20px', fontSize: '1.2rem' }}
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <button className="btn-add-to-cart" style={{ width: '100%', justifyContent: 'center' }} onClick={handleDeposit}>Xác nhận nạp</button>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
