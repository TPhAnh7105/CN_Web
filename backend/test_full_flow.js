
const testFlow = async () => {
    const email = 'login_test_' + Math.floor(Math.random()*999) + '@test.com';
    const pass = 'pass123';

    try {
        // 1. Register
        console.log('Testing Reg for:', email);
        const regRes = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'user' + Math.floor(Math.random()*999), email, password: pass })
        });
        
        if (!regRes.ok) throw new Error('Reg failed');

        // 2. Login Immediately
        console.log('Testing Login with:', email, pass);
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass })
        });
        const data = await loginRes.json();
        if (loginRes.ok) {
            console.log('✅ LOGIN SUCCESS!', data);
        } else {
            console.error('❌ LOGIN FAILED!', loginRes.status, data);
        }
    } catch (e) {
        console.error('Err:', e.message);
    }
};
testFlow();
