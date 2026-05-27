import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetUrl('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(response.data.message);
      if (response.data.resetUrl) {
          setResetUrl(response.data.resetUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
    setLoading(false);
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: 'var(--primary)', fontSize: '1.8rem' }}>Quên Mật Khẩu</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Nhập email để nhận link đặt lại mật khẩu</p>
        </div>

        {error && (
          <div style={{ background: '#fdecea', color: '#e74c3c', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ background: '#eafaf1', color: '#27ae60', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem' }}>
            {message}
            {resetUrl && (
              <div style={{ marginTop: '10px', wordBreak: 'break-all' }}>
                <a href={resetUrl} target="_blank" rel="noreferrer">{resetUrl}</a>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <Mail size={18} color="var(--text-muted)" />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn-add-to-cart" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px' }}>
          <Link to="/login" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
