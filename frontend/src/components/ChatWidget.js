import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, AlertCircle, Headphones, Plus, History } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// ==============================
// Component hiệu ứng chạy chữ (Typewriter)
// ==============================
const TypewriterText = ({ text, products, speed = 18, onComplete }) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (displayedLength < text.length) {
      const timer = setTimeout(() => {
        setDisplayedLength(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (!isDone) {
      setIsDone(true);
      onComplete?.();
    }
  }, [displayedLength, text.length, speed, isDone, onComplete]);

  const visibleText = text.substring(0, displayedLength);

  if (products && products.length > 0 && isDone) {
    const parts = text.split(/(\[PRODUCT:\d+\])/g);
    return (
      <>
        {parts.map((part, index) => {
          const match = part.match(/\[PRODUCT:(\d+)\]/);
          if (match) {
            const prodId = parseInt(match[1]);
            const product = products.find(p => p.id === prodId);
            if (product) {
              return (
                <Link to={`/products/${product.id}`} key={index} className="chat-product-card">
                  <img src={product.mainImage} alt={product.name} />
                  <div>
                    <strong>{product.name}</strong>
                    <span className="chat-product-price">
                      {Number(product.discountPrice || product.price).toLocaleString()} VNĐ
                    </span>
                  </div>
                </Link>
              );
            }
          }
          return <span key={index}>{part.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}</span>;
        })}
      </>
    );
  }

  const cleanVisible = visibleText.replace(/\[PRODUCT:\d+\]/g, '');
  return (
    <span>
      {cleanVisible.split('\n').map((line, i) => (
        <React.Fragment key={i}>{line}<br/></React.Fragment>
      ))}
      {!isDone && <span className="typewriter-cursor">|</span>}
    </span>
  );
};

// ==============================
// Component chính ChatWidget
// ==============================
const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingIndex, setTypingIndex] = useState(-1);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [sessionsList, setSessionsList] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Khởi tạo Session & Lịch sử
  useEffect(() => {
    const storageKey = user ? `chat_sessions_${user.id}` : 'chat_sessions_guest';
    const storage = user ? localStorage : sessionStorage;

    const savedData = storage.getItem(storageKey);
    let allSessions = savedData ? JSON.parse(savedData) : [];

    // Migrate from old chat_history if needed
    const oldStorageKey = user ? `chat_history_${user.id}` : 'chat_history_guest';
    const oldSavedData = storage.getItem(oldStorageKey);
    if (oldSavedData && allSessions.length === 0) {
      const parsedOld = JSON.parse(oldSavedData);
      const migratedSession = {
        sessionId: parsedOld.sessionId || 'sess_' + Math.random().toString(36).substr(2, 9),
        messages: parsedOld.messages || [],
        isAdminMode: parsedOld.isAdminMode || false,
        updatedAt: Date.now()
      };
      allSessions = [migratedSession];
      storage.removeItem(oldStorageKey);
    }
    
    if (allSessions.length === 0) {
      const newSessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
      const initialMsg = { role: 'model', text: 'Xin chào! Tôi là Trợ lý tư vấn của Luxe Furnish. Tôi có thể giúp bạn tìm kiếm nội thất hoặc giải đáp thắc mắc gì không?', typed: true };
      const newSession = { sessionId: newSessionId, messages: [initialMsg], isAdminMode: false, updatedAt: Date.now() };
      allSessions = [newSession];
    }
    
    // Sort by updated time desc
    allSessions.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    setSessionsList(allSessions);
    
    const activeSession = allSessions[0];
    setSessionId(activeSession.sessionId);
    setMessages(activeSession.messages || []);
    setIsAdminMode(activeSession.isAdminMode || false);
  }, [user]);

  // Cập nhật Storage mỗi khi có tin nhắn hoặc mode thay đổi
  useEffect(() => {
    if (messages.length === 0 || !sessionId) return;
    const storageKey = user ? `chat_sessions_${user.id}` : 'chat_sessions_guest';
    const storage = user ? localStorage : sessionStorage;
    
    setSessionsList(prevList => {
      const newList = [...prevList];
      const existingIndex = newList.findIndex(s => s.sessionId === sessionId);
      const sessionData = { sessionId, messages, isAdminMode, updatedAt: Date.now() };
      
      if (existingIndex >= 0) {
        newList[existingIndex] = sessionData;
      } else {
        newList.push(sessionData);
      }
      
      newList.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      storage.setItem(storageKey, JSON.stringify(newList));
      return newList;
    });
  }, [messages, isAdminMode, sessionId, user]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  useEffect(() => {
    if (typingIndex >= 0) {
      const interval = setInterval(scrollToBottom, 150);
      return () => clearInterval(interval);
    }
  }, [typingIndex, scrollToBottom]);

  const handleTypingComplete = useCallback((idx) => {
    setTypingIndex(-1);
    setMessages(prev => prev.map((m, i) => i === idx ? { ...m, typed: true } : m));
  }, []);

  // Polling Admin Replies
  useEffect(() => {
    if (!isOpen || !sessionId) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/chat/session/${sessionId}/replies`);
        if (res.data && res.data.length > 0) {
          setMessages(prev => {
            let updated = [...prev];
            let changed = false;
            res.data.forEach(adminMsg => {
              if (!updated.find(m => m.dbId === adminMsg.id)) {
                updated.push({ dbId: adminMsg.id, role: 'admin', text: adminMsg.message, typed: true });
                changed = true;
              }
            });
            return changed ? updated : prev;
          });
        }
      } catch (e) {}
    }, 4000); // Mỗi 4s check tin nhắn admin
    return () => clearInterval(interval);
  }, [isOpen, sessionId]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: 'user', text: userMessage, typed: true }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: userMessage,
        history: messages,
        sessionId: sessionId,
        userId: user ? user.id : null,
        adminMode: isAdminMode
      });

      // Nếu đang trong Admin Mode, backend chỉ log chứ không gọi AI
      if (isAdminMode) {
        setIsLoading(false);
        return;
      }

      const { reply, action, recommendedProducts } = response.data;
      const newIdx = newMessages.length; 
      
      setMessages(prev => [...prev, { role: 'model', text: reply, products: recommendedProducts, typed: false }]);
      setTypingIndex(newIdx);

      if (action) {
        if (action.name === 'trigger_checkout') {
          setTimeout(() => {
            navigate(`/products/${action.args.product_id}`);
          }, 2500);
        } else if (action.name === 'create_support_ticket') {
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              role: 'system', 
              text: `[HỆ THỐNG]: Yêu cầu hỗ trợ về vấn đề "${action.args.issue_description}" đã được ghi nhận.`,
              typed: true
            }]);
          }, 1500);
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: 'Xin lỗi, hệ thống của chúng tôi đang bận. Vui lòng thử lại sau!',
        typed: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = (targetSessionId) => {
    const sessionToLoad = sessionsList.find(s => s.sessionId === targetSessionId);
    if (sessionToLoad) {
      setSessionId(sessionToLoad.sessionId);
      setMessages(sessionToLoad.messages || []);
      setIsAdminMode(sessionToLoad.isAdminMode || false);
      setShowHistory(false);
    }
  };

  const createNewSession = () => {
    const newSessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
    setSessionId(newSessionId);
    setIsAdminMode(false);
    const initialMsg = { role: 'model', text: 'Xin chào! Cuộc trò chuyện mới đã được tạo. Tôi có thể giúp gì cho bạn?', typed: true };
    setMessages([initialMsg]);
    setShowHistory(false);
  };

  const toggleAdminMode = () => {
    const newMode = !isAdminMode;
    setIsAdminMode(newMode);
    if (newMode) {
      setMessages(prev => [...prev, { role: 'system', text: '[HỆ THỐNG]: Bạn đã được chuyển sang chế độ nhắn tin với Nhân viên hỗ trợ. Vui lòng để lại lời nhắn.', typed: true }]);
    } else {
      setMessages(prev => [...prev, { role: 'system', text: '[HỆ THỐNG]: Đã quay lại chế độ AI Chatbot tự động.', typed: true }]);
    }
  };

  const renderModelMessage = (msg, idx) => {
    if (!msg.typed) {
      return <TypewriterText text={msg.text} products={msg.products} speed={15} onComplete={() => handleTypingComplete(idx)} />;
    }
    if (msg.products && msg.products.length > 0) {
      const parts = msg.text.split(/(\[PRODUCT:\d+\])/g);
      return parts.map((part, index) => {
        const match = part.match(/\[PRODUCT:(\d+)\]/);
        if (match) {
          const prodId = parseInt(match[1]);
          const product = msg.products.find(p => p.id === prodId);
          if (product) {
            return (
              <Link to={`/products/${product.id}`} key={index} className="chat-product-card">
                <img src={product.mainImage} alt={product.name} />
                <div>
                  <strong>{product.name}</strong>
                  <span className="chat-product-price">
                    {Number(product.discountPrice || product.price).toLocaleString()} VNĐ
                  </span>
                </div>
              </Link>
            );
          }
        }
        return <span key={index}>{part.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}</span>;
      });
    }
    return msg.text.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="chat-fab" style={{ display: isOpen ? 'none' : 'flex' }}>
        <MessageCircle size={28} />
      </button>

      {isOpen && (
        <div className={`chat-window chat-window-enter`}>
          {/* Header */}
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="chat-avatar">
                {isAdminMode ? <Headphones size={20} /> : <Bot size={20} />}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                  {isAdminMode ? 'Hỗ trợ trực tuyến' : 'Luxe Assistant'}
                </h3>
                <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>● Trực tuyến</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={toggleAdminMode} title={isAdminMode ? "Quay lại AI" : "Gọi nhân viên"} className={`chat-action-btn ${isAdminMode ? 'active' : ''}`}>
                {isAdminMode ? <Bot size={16} /> : <Headphones size={16} />}
              </button>
              <button onClick={() => setShowHistory(!showHistory)} title="Lịch sử trò chuyện" className={`chat-action-btn ${showHistory ? 'active' : ''}`}>
                <History size={16} />
              </button>
              <button onClick={createNewSession} title="Cuộc trò chuyện mới" className="chat-action-btn">
                <Plus size={16} />
              </button>
              <button onClick={() => setIsOpen(false)} title="Đóng chat" className="chat-action-btn">
                <X size={16} />
              </button>
            </div>
          </div>

          {showHistory && (
            <div style={{ position: 'absolute', top: '55px', left: 0, right: 0, bottom: '60px', background: '#fff', zIndex: 10, overflowY: 'auto', padding: '10px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '1rem', color: '#2d3436', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>Lịch sử trò chuyện</h4>
              {sessionsList.map((session) => (
                <div 
                  key={session.sessionId} 
                  onClick={() => loadSession(session.sessionId)}
                  style={{ 
                    padding: '12px', 
                    marginBottom: '8px', 
                    borderRadius: '8px', 
                    background: session.sessionId === sessionId ? '#e3f2fd' : '#f8f9fa',
                    cursor: 'pointer',
                    border: session.sessionId === sessionId ? '1px solid #bbdefb' : '1px solid transparent',
                    transition: '0.2s'
                  }}
                  className="chat-history-item"
                >
                  <div style={{ fontSize: '0.85rem', color: '#2d3436', fontWeight: session.sessionId === sessionId ? '600' : '400', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {session.messages[session.messages.length - 1]?.text || 'Cuộc trò chuyện mới'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#b2bec3', marginTop: '4px' }}>
                    {new Date(session.updatedAt || Date.now()).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble-row ${msg.role === 'user' ? 'chat-bubble-right' : 'chat-bubble-left'}`}>
                <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : msg.role === 'system' ? 'chat-bubble-system' : (msg.role === 'admin' ? 'chat-bubble-user' : 'chat-bubble-model')}`} 
                     style={msg.role === 'admin' ? { background: '#27ae60', color: 'white' } : {}}>
                  {msg.role === 'system' && <AlertCircle size={14} style={{ marginRight: 5, verticalAlign: 'middle' }}/>}
                  {msg.role === 'admin' && <strong style={{display: 'block', fontSize: '0.75rem', marginBottom: '2px', opacity: 0.8}}>👨‍💼 Nhân viên:</strong>}
                  {(msg.role === 'model' || msg.role === 'admin') ? renderModelMessage(msg, idx) : msg.text}
                </div>
              </div>
            ))}
            {isLoading && !isAdminMode && (
              <div className="chat-bubble-row chat-bubble-left">
                <div className="chat-bubble chat-bubble-model">
                  <div className="typing-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="chat-input-bar">
            <input 
              type="text" value={input} onChange={e => setInput(e.target.value)}
              placeholder={isAdminMode ? "Nhập tin nhắn cho nhân viên..." : "Nhập tin nhắn..."} 
              className="chat-input"
              disabled={typingIndex >= 0}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim() || typingIndex >= 0}
              className="chat-send-btn"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
