import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';
import axios from 'axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
        return setError('Mật khẩu xác nhận không khớp');
    }

    setLoading(true);

    try {
      const response = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
      setMessage(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
    setLoading(false);
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: 'var(--primary)', fontSize: '1.8rem' }}>Đặt Lại Mật Khẩu</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Vui lòng nhập mật khẩu mới</p>
        </div>

        {error && (
          <div style={{ background: '#fdecea', color: '#e74c3c', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ background: '#eafaf1', color: '#27ae60', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={20} />
            {message}. Đang chuyển hướng...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <Lock size={18} color="var(--text-muted)" />
            <input type="password" placeholder="Mật khẩu mới" value={password} onChange={e => setPassword(e.target.value)} required minLength="6" />
          </div>
          <div className="auth-field">
            <Lock size={18} color="var(--text-muted)" />
            <input type="password" placeholder="Xác nhận mật khẩu mới" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength="6" />
          </div>
          <button type="submit" className="btn-add-to-cart" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '25px', color: 'var(--text-muted)' }}>
          <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Về trang Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
