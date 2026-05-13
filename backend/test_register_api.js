
const testRegistration = async () => {
    try {
        console.log('Gửi yêu cầu đăng ký thử nghiệm...');
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'testuser' + Math.floor(Math.random()*1000),
                email: 'test' + Math.floor(Math.random()*1000) + '@example.com',
                password: 'password123'
            })
        });
        const data = await response.json();
        if (response.ok) {
            console.log('✅ ĐĂNG KÝ THÀNH CÔNG!', data);
        } else {
            console.error('❌ Server responded with:', response.status, data);
        }
    } catch (error) {
        console.error('❌ Network Error:', error.message);
    }
};

testRegistration();
