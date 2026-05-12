import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock } from 'lucide-react';
import axios from 'axios';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    }
    setLoading(false);
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <UserPlus size={40} color="var(--secondary)" style={{ marginBottom: '10px' }} />
          <h2 style={{ color: 'var(--primary)', fontSize: '1.8rem' }}>Đăng Ký</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Tạo tài khoản LuxeFurnish</p>
        </div>

        {error && (
          <div style={{ background: '#fdecea', color: '#e74c3c', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <User size={18} color="var(--text-muted)" />
            <input type="text" name="username" placeholder="Tên người dùng" value={form.username} onChange={handleChange} required />
          </div>
          <div className="auth-field">
            <Mail size={18} color="var(--text-muted)" />
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="auth-field">
            <Lock size={18} color="var(--text-muted)" />
            <input type="password" name="password" placeholder="Mật khẩu" value={form.password} onChange={handleChange} required />
          </div>
          <div className="auth-field">
            <Lock size={18} color="var(--text-muted)" />
            <input type="password" name="confirmPassword" placeholder="Xác nhận mật khẩu" value={form.confirmPassword} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn-add-to-cart" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px', color: 'var(--text-muted)' }}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ color: 'var(--secondary)', fontWeight: '600', textDecoration: 'none' }}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
