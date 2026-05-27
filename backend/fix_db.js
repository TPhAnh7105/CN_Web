require('dotenv').config({ path: '../.env' });
const { sequelize } = require('./src/config/db');

async function fixDb() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Check if column discountPrice exists
    const [results] = await sequelize.query("SHOW COLUMNS FROM Products LIKE 'discountPrice'");
    if (results.length === 0) {
      console.log('Column discountPrice does not exist. Adding it...');
      await sequelize.query("ALTER TABLE Products ADD COLUMN discountPrice DECIMAL(10,2) NULL");
      console.log('Column discountPrice added successfully.');
    } else {
      console.log('Column discountPrice already exists.');
    }

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

fixDb();
