import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { History, ArrowDownRight, ArrowUpLeft } from 'lucide-react';

const Transactions = () => {
  const { token } = useAuth();
  const [list, setList] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get('http://localhost:5000/api/users/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setList(res.data);
    };
    if(token) load();
  }, [token]);

  return (
    <div style={{ paddingTop: '120px', minHeight: '80vh' }} className="container">
      <h2 className="section-title" style={{ marginBottom: '40px' }}>Lịch sử giao dịch</h2>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {list.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', borderBottom: '1px solid #eee' }}>
            {t.type === 'deposit' ? <div style={{ background: '#e8f6ec', padding: '10px', borderRadius: '50%' }}><ArrowDownRight color="#27ae60" /></div> 
                                  : <div style={{ background: '#fdecea', padding: '10px', borderRadius: '50%' }}><ArrowUpLeft color="#e74c3c" /></div>}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600' }}>{t.description || (t.type === 'deposit' ? 'Nạp tiền' : 'Thanh toán')}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleString('vi-VN')}</div>
            </div>
            <div style={{ fontWeight: '700', color: t.type === 'deposit' ? '#27ae60' : '#e74c3c', fontSize: '1.1rem' }}>
              {t.type === 'deposit' ? '+' : '-'}{Number(t.amount).toLocaleString('vi-VN')} ₫
            </div>
          </div>
        ))}
        {list.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có giao dịch nào.</div>}
      </div>
    </div>
  );
};

export default Transactions;
