require('dotenv').config({ path: '../.env' });
const { sequelize } = require('./src/config/db');

async function alterDb() {
  try {
    await sequelize.authenticate();
    const queryInterface = sequelize.getQueryInterface();
    
    try {
        await queryInterface.addColumn('Products', 'colors', {
            type: require('sequelize').DataTypes.STRING,
            allowNull: true
        });
        console.log("Đã thêm cột colors.");
    } catch (e) {
        console.log("colors: ", e.message);
    }
    
    try {
        await queryInterface.addColumn('Products', 'sizes', {
            type: require('sequelize').DataTypes.STRING,
            allowNull: true
        });
        console.log("Đã thêm cột sizes.");
    } catch (e) {
        console.log("sizes: ", e.message);
    }
    
    console.log("Hoàn tất cập nhật cấu trúc DB!");
  } catch (error) {
    console.error("Lỗi:", error.message);
  } finally {
    process.exit(0);
  }
}
alterDb();
