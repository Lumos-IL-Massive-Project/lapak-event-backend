const db = require("../config/db");

const up = () => {
  db.promise()
    .query(
      `
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(30) NOT NULL,
        rating VARCHAR(2) DEFAULT NULL,
        total_rating INT DEFAULT NULL,
        price DECIMAL(15, 2) NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );  
    `
    )
    .then(() => {
      console.log('Table "products" created successfully');
    })
    .catch((error) => {
      console.log('Table "products" failed to create');
      console.error(error);
    });
};

const down = () => {
  db.promise()
    .query(
      `
    DROP TABLE IF EXISTS products
  `
    )
    .then(() => {
      console.log('Table "products" dropped successfully');
    })
    .catch((error) => {
      console.log('Table "products" failed to dropped');
      console.error(error);
    });
};

module.exports = {
  up,
  down,
};
