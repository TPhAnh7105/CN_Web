import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import axios from 'axios';
import { removeDiacritics } from '../utils/text';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [location.search]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      const query = removeDiacritics(searchQuery);
      const filtered = response.data.filter(p =>
        removeDiacritics(p.name).includes(query) ||
        (p.type && removeDiacritics(p.type).includes(query)) ||
        (p.style && removeDiacritics(p.style).includes(query)) ||
        (p.room && removeDiacritics(p.room).includes(query))
      );
      setResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '80vh' }}>
      <div className="container" style={{ padding: '40px 20px' }}>
        <h1 className="section-title" style={{ marginBottom: '30px' }}>Tìm Kiếm Sản Phẩm</h1>

        {/* Search Form */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex', gap: '10px', maxWidth: '600px', margin: '0 auto 40px',
        }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập tên sản phẩm, loại, phong cách..."
            className="search-input-page"
          />
          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SearchIcon size={18} /> Tìm
          </button>
        </form>

        {/* Results */}
        {loading && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Đang tìm kiếm...</p>}

        {searched && !loading && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px' }}>
            Tìm thấy <strong>{results.length}</strong> sản phẩm cho "<strong>{query}</strong>"
          </p>
        )}

        {results.length > 0 && (
          <div className="products-grid">
            {results.map(product => (
              <Link key={product.id} to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="product-card">
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <img src={product.mainImage} alt={product.name} className="product-img" />
                  </div>
                  <div className="product-info">
                    <div className="product-category">{product.room || product.type}</div>
                    <h3 className="product-title">{product.name}</h3>
                    <div className="product-footer">
                      <div className="product-price">{Number(product.price).toLocaleString('vi-VN')} ₫</div>
                      <span className="add-to-cart">Xem chi tiết</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {searched && !loading && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <SearchIcon size={60} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '20px' }} />
            <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Không tìm thấy sản phẩm</h3>
            <p style={{ color: 'var(--text-muted)' }}>Hãy thử tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
