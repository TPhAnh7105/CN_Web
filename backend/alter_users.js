require('dotenv').config({ path: '../.env' });
const { sequelize } = require('./src/config/db');

async function alterDb() {
  try {
    await sequelize.authenticate();
    const queryInterface = sequelize.getQueryInterface();
    
    try {
        await queryInterface.addColumn('Users', 'isBlocked', {
            type: require('sequelize').DataTypes.BOOLEAN,
            defaultValue: false
        });
        console.log("Đã thêm cột isBlocked.");
    } catch (e) {
        console.log("isBlocked: ", e.message);
    }
    
    try {
        await queryInterface.addColumn('Users', 'blockReason', {
            type: require('sequelize').DataTypes.TEXT,
            allowNull: true
        });
        console.log("Đã thêm cột blockReason.");
    } catch (e) {
        console.log("blockReason: ", e.message);
    }
    
    console.log("Hoàn tất cập nhật cấu trúc DB!");
  } catch (error) {
    console.error("Lỗi:", error.message);
  } finally {
    process.exit(0);
  }
}
alterDb();
