require('dotenv').config({ path: '../.env' });
const { sequelize } = require('./src/config/db');

async function alterDb() {
  try {
    await sequelize.authenticate();
    const queryInterface = sequelize.getQueryInterface();
    
    try {
        await queryInterface.addColumn('OrderItems', 'color', {
            type: require('sequelize').DataTypes.STRING,
            allowNull: true
        });
        console.log("Đã thêm cột color.");
    } catch (e) {
        console.log("color: ", e.message);
    }
    
    try {
        await queryInterface.addColumn('OrderItems', 'size', {
            type: require('sequelize').DataTypes.STRING,
            allowNull: true
        });
        console.log("Đã thêm cột size.");
    } catch (e) {
        console.log("size: ", e.message);
    }
    
    console.log("Hoàn tất cập nhật cấu trúc DB!");
  } catch (error) {
    console.error("Lỗi:", error.message);
  } finally {
    process.exit(0);
  }
}
alterDb();
