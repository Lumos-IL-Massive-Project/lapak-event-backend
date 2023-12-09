const db = require("../config/db");

const up = () => {
  db.promise()
    .query(
      `
      CREATE TABLE IF NOT EXISTS product_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );  
    `
    )
    .then(() => {
      console.log('Table "product_categories" created successfully');
    })
    .catch((error) => {
      console.log('Table "product_categories" failed to create');
      console.error(error);
    });
};

const down = () => {
  db.promise()
    .query(
      `
    DROP TABLE IF EXISTS product_categories
  `
    )
    .then(() => {
      console.log('Table "product_categories" dropped successfully');
    })
    .catch((error) => {
      console.log('Table "product_categories" failed to dropped');
      console.error(error);
    });
};

module.exports = {
  up,
  down,
};
