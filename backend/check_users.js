require('dotenv').config({ path: '../.env' });
const { connectDB } = require('./src/config/db');
const User = require('./src/models/user.model');

const checkUsers = async () => {
    try {
        await connectDB();
        const count = await User.count();
        console.log(`Tổng số người dùng trong DB: ${count}`);
        if (count > 0) {
            const users = await User.findAll({ attributes: ['username', 'email'] });
            console.log('Danh sách emails đã đăng ký:');
            users.forEach(u => console.log(`- ${u.email}`));
        } else {
            console.log('CHƯA CÓ NGƯỜI DÙNG NÀO! Cần đăng ký trước.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Lỗi kiểm tra DB:', err.message);
        process.exit(1);
    }
};

checkUsers();
