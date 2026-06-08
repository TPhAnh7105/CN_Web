require('dotenv').config({ path: '../.env' });
const { sequelize } = require('./src/config/db');

async function alterDb() {
  try {
    await sequelize.authenticate();
    const queryInterface = sequelize.getQueryInterface();
    
    try {
        await queryInterface.addColumn('Users', 'blockExpiresAt', {
            type: require('sequelize').DataTypes.DATE,
            allowNull: true
        });
        console.log("Đã thêm cột blockExpiresAt.");
    } catch (e) {
        console.log("blockExpiresAt: ", e.message);
    }
    
    console.log("Hoàn tất cập nhật cấu trúc DB!");
  } catch (error) {
    console.error("Lỗi:", error.message);
  } finally {
    process.exit(0);
  }
}
alterDb();
