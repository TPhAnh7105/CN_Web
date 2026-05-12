require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcrypt');
const { connectDB, sequelize } = require('./src/config/db');
const Category = require('./src/models/category.model');
const Product = require('./src/models/product.model');
const User = require('./src/models/user.model');
const Order = require('./src/models/order.model');
const OrderItem = require('./src/models/orderItem.model');
const Transaction = require('./src/models/transaction.model');

const seedData = async () => {
    try {
        await connectDB();
        await sequelize.sync({ force: true });

        console.log('🔄 Đang tiến hành thêm dữ liệu phân loại mới vào Database...');

        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);
        await User.create({ username: 'admin', email: 'admin@furniture.com', password: adminPassword, role: 'admin' });
        
        // Seed the user test account with initial cash balance
        const testPass = await bcrypt.hash('123456', salt);
        await User.create({ 
            username: 'Neivos', 
            email: 'trinhphucanh2005@gmail.com', 
            password: testPass, 
            role: 'customer', 
            balance: 500000000.00 
        });

        const categoriesData = [
            { name: 'Phòng khách', description: 'Nội thất phòng khách sang trọng' },
            { name: 'Phòng ngủ', description: 'Không gian nghỉ ngơi thư giãn' },
            { name: 'Phòng ăn & Bếp', description: 'Ấm cúng từng bữa ăn' },
            { name: 'Phòng làm việc', description: 'Khơi nguồn sáng tạo' },
            { name: 'Ngoài trời', description: 'Thư giãn cùng thiên nhiên' }
        ];

        const createdCategories = {};
        for (const cat of categoriesData) {
            const category = await Category.create(cat);
            createdCategories[cat.name] = category.id;
        }

        const productsData = [
            // --- Phòng Khách ---
            { name: 'Sofa Da Cao Cấp L-Shape', price: 35000000, room: 'Phòng khách', type: 'Sofa', style: 'Hiện đại', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800' },
            { name: 'Bàn Trà Gỗ Óc Chó', price: 12500000, room: 'Phòng khách', type: 'Bàn gỗ', style: 'Cổ điển', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=800' },
            { name: 'Ghế Armchair Thư Giãn', price: 8900000, room: 'Phòng khách', type: 'Ghế gỗ', style: 'Bắc Âu', image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=800' },
            { name: 'Kệ Tivi Kính Cường Lực', price: 6500000, room: 'Phòng khách', type: 'Tủ', style: 'Hiện đại', image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=800' },
            { name: 'Sofa Vải Nỉ 3 Chỗ', price: 18000000, room: 'Phòng khách', type: 'Sofa', style: 'Tối giản', image: 'https://images.unsplash.com/photo-1540574163026-643ea20d25b5?auto=format&fit=crop&q=80&w=800' },
            { name: 'Bàn Góc Trang Trí', price: 3200000, room: 'Phòng khách', type: 'Bàn gỗ', style: 'Hiện đại', image: 'https://images.unsplash.com/photo-1506898667547-42e22a46e125?auto=format&fit=crop&q=80&w=800' },
            { name: 'Thảm Trải Sàn Lông Cừu', price: 4500000, room: 'Phòng khách', type: 'Đồ trang trí', style: 'Bắc Âu', image: 'https://images.unsplash.com/photo-1528208079124-a2387f039c99?auto=format&fit=crop&q=80&w=800' },
            { name: 'Đèn Cây Đứng Minimalist', price: 2800000, room: 'Phòng khách', type: 'Đồ trang trí', style: 'Tối giản', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e9d15?auto=format&fit=crop&q=80&w=800' },

            // --- Phòng Ngủ ---
            { name: 'Giường Ngủ Bọc Nỉ Đầu Giường', price: 15500000, room: 'Phòng ngủ', type: 'Giường', style: 'Hiện đại', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800' },
            { name: 'Tủ Quần Áo Cánh Kính', price: 28000000, room: 'Phòng ngủ', type: 'Tủ', style: 'Hiện đại', image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=800' },
            { name: 'Bàn Trang Điểm Bắc Âu', price: 4200000, room: 'Phòng ngủ', type: 'Bàn gỗ', style: 'Bắc Âu', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800' },
            { name: 'Giường Gỗ Sồi Hiện Đại', price: 18000000, room: 'Phòng ngủ', type: 'Giường', style: 'Tối giản', image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=800' },
            { name: 'Tủ Đầu Giường Thông Minh', price: 2500000, room: 'Phòng ngủ', type: 'Tủ', style: 'Hiện đại', image: 'https://images.unsplash.com/photo-1532372576444-ea2f10b501f2?auto=format&fit=crop&q=80&w=800' },
            { name: 'Ghế Thư Giãn Đọc Sách', price: 6000000, room: 'Phòng ngủ', type: 'Ghế gỗ', style: 'Bắc Âu', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800' },
            { name: 'Đèn Ngủ Cảm Ứng LED', price: 1200000, room: 'Phòng ngủ', type: 'Đồ trang trí', style: 'Hiện đại', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800' },
            { name: 'Gương Đứng Khung Gỗ', price: 3000000, room: 'Phòng ngủ', type: 'Đồ trang trí', style: 'Cổ điển', image: 'https://images.unsplash.com/photo-1618220048045-10a6dbdf83e0?auto=format&fit=crop&q=80&w=800' },

            // --- Phòng Ăn & Bếp ---
            { name: 'Bộ Bàn Ăn 6 Ghế Sồi Nga', price: 18500000, room: 'Phòng ăn & Bếp', type: 'Bàn gỗ', style: 'Cổ điển', image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=800' },
            { name: 'Tủ Bếp Acrylic Bóng Gương', price: 45000000, room: 'Phòng ăn & Bếp', type: 'Tủ', style: 'Hiện đại', image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=800' },
            { name: 'Đảo Bếp Đa Năng', price: 12000000, room: 'Phòng ăn & Bếp', type: 'Bàn gỗ', style: 'Tối giản', image: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&q=80&w=800' },
            { name: 'Ghế Bar Gỗ Chân Sắt', price: 1500000, room: 'Phòng ăn & Bếp', type: 'Ghế gỗ', style: 'Công nghiệp', image: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=800' },
            { name: 'Kệ Rượu Gắn Tường', price: 2800000, room: 'Phòng ăn & Bếp', type: 'Tủ', style: 'Hiện đại', image: 'https://images.unsplash.com/photo-1585501865243-718de6042db6?auto=format&fit=crop&q=80&w=800' },
            { name: 'Bàn Tròn Gấp Gọn', price: 5500000, room: 'Phòng ăn & Bếp', type: 'Bàn gỗ', style: 'Bắc Âu', image: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=800' },
            { name: 'Đèn Thả Trần Bàn Ăn', price: 3200000, room: 'Phòng ăn & Bếp', type: 'Đồ trang trí', style: 'Hiện đại', image: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&q=80&w=800' },

            // --- Phòng Làm Việc ---
            { name: 'Ghế Công Thái Học Ergonomic', price: 6800000, room: 'Phòng làm việc', type: 'Ghế gỗ', style: 'Hiện đại', image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800' },
            { name: 'Bàn Chữ K Chân Sắt', price: 1800000, room: 'Phòng làm việc', type: 'Bàn gỗ', style: 'Công nghiệp', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=800' },
            { name: 'Bàn Giám Đốc Cao Cấp', price: 15000000, room: 'Phòng làm việc', type: 'Bàn gỗ', style: 'Cổ điển', image: 'https://images.unsplash.com/photo-1497215848122-38e7456d2524?auto=format&fit=crop&q=80&w=800' },
            { name: 'Kệ Sách Thông Minh 5 Tầng', price: 3500000, room: 'Phòng làm việc', type: 'Tủ', style: 'Tối giản', image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=800' },
            { name: 'Tủ Tài Liệu Gỗ', price: 4200000, room: 'Phòng làm việc', type: 'Tủ', style: 'Cổ điển', image: 'https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&q=80&w=800' },
            { name: 'Đèn Bàn Cảm Ứng Chống Cận', price: 950000, room: 'Phòng làm việc', type: 'Đồ trang trí', style: 'Hiện đại', image: 'https://images.unsplash.com/photo-1534346853763-71a74d2bcf3b?auto=format&fit=crop&q=80&w=800' },
            { name: 'Sofa Văng Mini Góc Đọc Sách', price: 5500000, room: 'Phòng làm việc', type: 'Sofa', style: 'Bắc Âu', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800' },
            { name: 'Ghế Xoay Lưới Văn Phòng', price: 2100000, room: 'Phòng làm việc', type: 'Ghế gỗ', style: 'Tối giản', image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=800' },

            // --- Ngoài Trời ---
            { name: 'Ghế Mây Thư Giãn Hình Trứng', price: 5500000, room: 'Ngoài trời', type: 'Ghế gỗ', style: 'Bắc Âu', image: 'https://images.unsplash.com/photo-1596079890744-c1a0462d0975?auto=format&fit=crop&q=80&w=800' },
            { name: 'Bộ Bàn Trà Ban Công Nho Nhỏ', price: 3200000, room: 'Ngoài trời', type: 'Bàn gỗ', style: 'Hiện đại', image: 'https://images.unsplash.com/photo-1533044309907-0fa3419eaabc?auto=format&fit=crop&q=80&w=800' },
            { name: 'Sofa Mây Nhựa Góc Vuông', price: 12500000, room: 'Ngoài trời', type: 'Sofa', style: 'Tối giản', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800' },
            { name: 'Xích Đu Gỗ Dây Thừng', price: 4500000, room: 'Ngoài trời', type: 'Ghế gỗ', style: 'Cổ điển', image: 'https://images.unsplash.com/photo-1536640539151-6c1ed201ff6c?auto=format&fit=crop&q=80&w=800' },
            { name: 'Giường Tắm Nắng Hồ Bơi', price: 6800000, room: 'Ngoài trời', type: 'Giường', style: 'Hiện đại', image: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&q=80&w=800' },
            { name: 'Ô Dù Lệch Tâm Tròn', price: 2500000, room: 'Ngoài trời', type: 'Đồ trang trí', style: 'Hiện đại', image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=800' },
            { name: 'Kệ Trồng Cây Thép Chống Rỉ', price: 1200000, room: 'Ngoài trời', type: 'Tủ', style: 'Công nghiệp', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800' }
        ];

        const productsToInsert = productsData.map(p => ({
            name: p.name,
            price: p.price,
            categoryId: createdCategories[p.room] || null, // Vẫn giữ categoryId để đảm bảo cấu trúc cũ
            room: p.room,
            type: p.type,
            style: p.style,
            mainImage: p.image,
            description: `Sản phẩm ${p.name} thuộc phong cách ${p.style}, loại ${p.type}. Vật liệu cao cấp, mang lại vẻ đẹp và công năng hoàn hảo.`,
            stock: Math.floor(Math.random() * 50) + 10,
            segment: p.price >= 20000000 ? 'Cao cấp' : (p.price >= 8000000 ? 'Trung lưu' : 'Bình dân')
        }));

        await Product.bulkCreate(productsToInsert);
        console.log(`✅ Đã thêm ${productsToInsert.length} Sản phẩm với đầy đủ Phân loại (Loại, Phòng, Phong cách) thành công!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
};

seedData();
