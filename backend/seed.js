require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcrypt');
const { connectDB, sequelize } = require('./src/config/db');
const Category = require('./src/models/category.model');
const Product = require('./src/models/product.model');
const User = require('./src/models/user.model');
const Order = require('./src/models/order.model');
const OrderItem = require('./src/models/orderItem.model');
const Transaction = require('./src/models/transaction.model');
const Type = require('./src/models/type.model');
const Style = require('./src/models/style.model');
const Segment = require('./src/models/segment.model');

const seedData = async () => {
    try {
        await connectDB();
        await sequelize.sync({ force: true });

        console.log('🔄 Đang tiến hành thêm dữ liệu phân loại độc lập mới vào Database...');

        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);
        await User.create({ username: 'admin', email: 'admin@furniture.com', password: adminPassword, role: 'admin' });
        
        // Seed the user test account
        const testPass = await bcrypt.hash('123456', salt);
        await User.create({ 
            username: 'Neivos', 
            email: 'trinhphucanh2005@gmail.com', 
            password: testPass, 
            role: 'customer', 
            balance: 500000000.00 
        });

        // 1. Seed Categories
        const categoriesData = [
            { name: 'Phòng khách' },
            { name: 'Phòng ngủ' },
            { name: 'Phòng ăn & Bếp' },
            { name: 'Phòng làm việc' },
            { name: 'Ngoài trời' }
        ];

        const createdCategories = {};
        for (const cat of categoriesData) {
            const category = await Category.create(cat);
            createdCategories[cat.name] = category.id;
        }

        const productsData = [
            // --- Phòng Khách ---
            { name: 'Sofa Da Cao Cấp L-Shape', price: 35000000, room: 'Phòng khách', type: 'Sofa', style: 'Hiện đại', image: 'https://picsum.photos/seed/furn23/800/600' },
            { name: 'Bàn Trà Gỗ Óc Chó', price: 12500000, room: 'Phòng khách', type: 'Bàn gỗ', style: 'Cổ điển', image: 'https://picsum.photos/seed/furn24/800/600' },
            { name: 'Ghế Armchair Thư Giãn', price: 8900000, room: 'Phòng khách', type: 'Ghế gỗ', style: 'Bắc Âu', image: 'https://picsum.photos/seed/furn25/800/600' },
            { name: 'Kệ Tivi Kính Cường Lực', price: 6500000, room: 'Phòng khách', type: 'Tủ', style: 'Hiện đại', image: 'https://picsum.photos/seed/furn26/800/600' },
            { name: 'Sofa Vải Nỉ 3 Chỗ', price: 18000000, room: 'Phòng khách', type: 'Sofa', style: 'Tối giản', image: 'https://picsum.photos/seed/furn27/800/600' },
            { name: 'Bàn Góc Trang Trí', price: 3200000, room: 'Phòng khách', type: 'Bàn gỗ', style: 'Hiện đại', image: 'https://picsum.photos/seed/furn28/800/600' },
            { name: 'Thảm Trải Sàn Lông Cừu', price: 4500000, room: 'Phòng khách', type: 'Đồ trang trí', style: 'Bắc Âu', image: 'https://picsum.photos/seed/furn29/800/600' },
            { name: 'Đèn Cây Đứng Minimalist', price: 2800000, room: 'Phòng khách', type: 'Đồ trang trí', style: 'Tối giản', image: 'https://picsum.photos/seed/furn30/800/600' },

            // --- Phòng Ngủ ---
            { name: 'Giường Ngủ Bọc Nỉ Đầu Giường', price: 15500000, room: 'Phòng ngủ', type: 'Giường', style: 'Hiện đại', image: 'https://picsum.photos/seed/furn31/800/600' },
            { name: 'Tủ Quần Áo Cánh Kính', price: 28000000, room: 'Phòng ngủ', type: 'Tủ', style: 'Hiện đại', image: 'https://picsum.photos/seed/furn32/800/600' },
            { name: 'Bàn Trang Điểm Bắc Âu', price: 4200000, room: 'Phòng ngủ', type: 'Bàn gỗ', style: 'Bắc Âu', image: 'https://picsum.photos/seed/furn33/800/600' },
            { name: 'Giường Gỗ Sồi Hiện Đại', price: 18000000, room: 'Phòng ngủ', type: 'Giường', style: 'Tối giản', image: 'https://picsum.photos/seed/furn34/800/600' },
            { name: 'Tủ Đầu Giường Thông Minh', price: 2500000, room: 'Phòng ngủ', type: 'Tủ', style: 'Hiện đại', image: 'https://picsum.photos/seed/furn35/800/600' },
            { name: 'Ghế Thư Giãn Đọc Sách', price: 6000000, room: 'Phòng ngủ', type: 'Ghế gỗ', style: 'Bắc Âu', image: 'https://picsum.photos/seed/furn36/800/600' },
            { name: 'Đèn Ngủ Cảm Ứng LED', price: 1200000, room: 'Phòng ngủ', type: 'Đồ trang trí', style: 'Hiện đại', image: 'https://picsum.photos/seed/furn37/800/600' },
            { name: 'Gương Đứng Khung Gỗ', price: 3000000, room: 'Phòng ngủ', type: 'Đồ trang trí', style: 'Cổ điển', image: 'https://picsum.photos/seed/furn38/800/600' },

            // --- Phòng Ăn & Bếp ---
            { name: 'Bộ Bàn Ăn 6 Ghế Sồi Nga', price: 18500000, room: 'Phòng ăn & Bếp', type: 'Bàn gỗ', style: 'Cổ điển', image: 'https://picsum.photos/seed/furn39/800/600' },
            { name: 'Tủ Bếp Acrylic Bóng Gương', price: 45000000, room: 'Phòng ăn & Bếp', type: 'Tủ', style: 'Hiện đại', image: 'https://picsum.photos/seed/furn40/800/600' },
            { name: 'Đảo Bếp Đa Năng', price: 12000000, room: 'Phòng ăn & Bếp', type: 'Bàn gỗ', style: 'Tối giản', image: 'https://picsum.photos/seed/furn41/800/600' },
            { name: 'Ghế Bar Gỗ Chân Sắt', price: 1500000, room: 'Phòng ăn & Bếp', type: 'Ghế gỗ', style: 'Công nghiệp', image: 'https://picsum.photos/seed/furn42/800/600' },
            { name: 'Kệ Rượu Gắn Tường', price: 2800000, room: 'Phòng ăn & Bếp', type: 'Tủ', style: 'Hiện đại', image: 'https://picsum.photos/seed/furn43/800/600' },
            { name: 'Bàn Tròn Gấp Gọn', price: 5500000, room: 'Phòng ăn & Bếp', type: 'Bàn gỗ', style: 'Bắc Âu', image: 'https://picsum.photos/seed/furn44/800/600' },
            { name: 'Đèn Thả Trần Bàn Ăn', price: 3200000, room: 'Phòng ăn & Bếp', type: 'Đồ trang trí', style: 'Hiện đại', image: 'https://picsum.photos/seed/furn45/800/600' },

            // --- Phòng Làm Việc ---
            { name: 'Ghế Công Thái Học Ergonomic', price: 6800000, room: 'Phòng làm việc', type: 'Ghế gỗ', style: 'Hiện đại', image: 'https://picsum.photos/seed/furn46/800/600' },
            { name: 'Bàn Chữ K Chân Sắt', price: 1800000, room: 'Phòng làm việc', type: 'Bàn gỗ', style: 'Công nghiệp', image: 'https://picsum.photos/seed/furn47/800/600' },
            { name: 'Bàn Giám Đốc Cao Cấp', price: 15000000, room: 'Phòng làm việc', type: 'Bàn gỗ', style: 'Cổ điển', image: 'https://picsum.photos/seed/furn48/800/600' },
            { name: 'Kệ Sách Thông Minh 5 Tầng', price: 3500000, room: 'Phòng làm việc', type: 'Tủ', style: 'Tối giản', image: 'https://picsum.photos/seed/furn49/800/600' },
            { name: 'Tủ Tài Liệu Gỗ', price: 4200000, room: 'Phòng làm việc', type: 'Tủ', style: 'Cổ điển', image: 'https://picsum.photos/seed/furn50/800/600' },
            { name: 'Đèn Bàn Cảm Ứng Chống Cận', price: 950000, room: 'Phòng làm việc', type: 'Đồ trang trí', style: 'Hiện đại', image: 'https://picsum.photos/seed/furn51/800/600' },
            { name: 'Sofa Văng Mini Góc Đọc Sách', price: 5500000, room: 'Phòng làm việc', type: 'Sofa', style: 'Bắc Âu', image: 'https://picsum.photos/seed/furn52/800/600' },
            { name: 'Ghế Xoay Lưới Văn Phòng', price: 2100000, room: 'Phòng làm việc', type: 'Ghế gỗ', style: 'Tối giản', image: 'https://picsum.photos/seed/furn53/800/600' },

            // --- Ngoài Trời ---
            { name: 'Ghế Mây Thư Giãn Hình Trứng', price: 5500000, room: 'Ngoài trời', type: 'Ghế gỗ', style: 'Bắc Âu', image: 'https://picsum.photos/seed/furn54/800/600' },
            { name: 'Bộ Bàn Trà Ban Công Nho Nhỏ', price: 3200000, room: 'Ngoài trời', type: 'Bàn gỗ', style: 'Hiện đại', image: 'https://picsum.photos/seed/furn55/800/600' },
            { name: 'Sofa Mây Nhựa Góc Vuông', price: 12500000, room: 'Ngoài trời', type: 'Sofa', style: 'Tối giản', image: 'https://picsum.photos/seed/furn56/800/600' },
            { name: 'Xích Đu Gỗ Dây Thừng', price: 4500000, room: 'Ngoài trời', type: 'Ghế gỗ', style: 'Cổ điển', image: 'https://picsum.photos/seed/furn57/800/600' },
            { name: 'Giường Tắm Nắng Hồ Bơi', price: 6800000, room: 'Ngoài trời', type: 'Giường', style: 'Hiện đại', image: 'https://picsum.photos/seed/furn58/800/600' },
            { name: 'Ô Dù Lệch Tâm Tròn', price: 2500000, room: 'Ngoài trời', type: 'Đồ trang trí', style: 'Hiện đại', image: 'https://picsum.photos/seed/furn59/800/600' },
            { name: 'Kệ Trồng Cây Thép Chống Rỉ', price: 1200000, room: 'Ngoài trời', type: 'Tủ', style: 'Công nghiệp', image: 'https://picsum.photos/seed/furn60/800/600' }
        ];

        // 2. Seed Unique Styles
        const uniqueStyles = [...new Set(productsData.map(p => p.style))];
        const createdStyles = {};
        for (const styleName of uniqueStyles) {
            const style = await Style.create({ name: styleName });
            createdStyles[styleName] = style.id;
        }

        // 3. Seed Unique Types
        const uniqueTypes = [...new Set(productsData.map(p => p.type))];
        const createdTypes = {}; 
        for (const typeName of uniqueTypes) {
            const type = await Type.create({ name: typeName });
            createdTypes[typeName] = type.id;
        }

        // 4. Seed Segments (Phân khúc)
        const segmentsData = ['Bình dân', 'Trung lưu', 'Cao cấp'];
        const createdSegments = {};
        for (const segName of segmentsData) {
            const segment = await Segment.create({ name: segName });
            createdSegments[segName] = segment.id;
        }

        // Prepare products linked with all 4 separate lookup tables
        const productsToInsert = productsData.map(p => {
            const segmentName = p.price >= 20000000 ? 'Cao cấp' : (p.price >= 8000000 ? 'Trung lưu' : 'Bình dân');
            return {
                name: p.name,
                price: p.price,
                categoryId: createdCategories[p.room] || null,
                typeId: createdTypes[p.type] || null,
                styleId: createdStyles[p.style] || null,
                segmentId: createdSegments[segmentName] || null,
                mainImage: p.image,
                description: `Sản phẩm ${p.name} thuộc phong cách ${p.style}, loại ${p.type}. Vật liệu cao cấp, mang lại vẻ đẹp và công năng hoàn hảo.`,
                stock: Math.floor(Math.random() * 50) + 10
            };
        });

        await Product.bulkCreate(productsToInsert);
        console.log(`✅ Đã thêm ${productsToInsert.length} Sản phẩm với 4 bảng dữ liệu tách rời độc lập thành công!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi seeding:', error);
        process.exit(1);
    }
};

seedData();
