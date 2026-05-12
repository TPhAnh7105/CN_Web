require('dotenv').config({ path: '../.env' });
const { sequelize } = require('./src/config/db');
const Attribute = require('./src/models/attribute.model');

const bootstrapAttrs = async () => {
    try {
        await sequelize.sync(); // ensure table exists
        const count = await Attribute.count();
        if(count > 0) { console.log('Already has attributes.'); process.exit(0); }

        const data = [
            // Types
            { group: 'type', name: 'Bàn gỗ' },
            { group: 'type', name: 'Ghế gỗ' },
            { group: 'type', name: 'Sofa' },
            { group: 'type', name: 'Tủ' },
            { group: 'type', name: 'Giường' },
            { group: 'type', name: 'Đồ trang trí' },
            // Styles
            { group: 'style', name: 'Hiện đại' },
            { group: 'style', name: 'Tối giản' },
            { group: 'style', name: 'Bắc Âu' },
            { group: 'style', name: 'Cổ điển' },
            { group: 'style', name: 'Công nghiệp' },
            // Segments
            { group: 'segment', name: 'Bình dân' },
            { group: 'segment', name: 'Trung lưu' },
            { group: 'segment', name: 'Cao cấp' }
        ];

        await Attribute.bulkCreate(data);
        console.log('Successfully seeded initial attributes!');
        process.exit(0);
    } catch (e) { console.error(e); process.exit(1); }
};
bootstrapAttrs();
