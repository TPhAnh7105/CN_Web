require('dotenv').config({path: '../.env'});
const { sequelize } = require('./src/config/db');

sequelize.query("ALTER TABLE Products ADD COLUMN detailedDescription TEXT NULL;")
   .then(() => { console.log('Added detailedDescription'); process.exit(0); })
   .catch(e => { console.error(e.message); process.exit(1); });
