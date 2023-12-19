const db = require("../config/db");

const up = () => {
  db.promise()
    .query(
      `
      CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT DEFAULT NULL,
        image_url VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );  
    `
    )
    .then(() => {
      console.log('Table "product_images" created successfully');
    })
    .catch((error) => {
      console.log('Table "product_images" failed to create');
      console.error(error);
    });
};

const down = () => {
  db.promise()
    .query(
      `
    DROP TABLE IF EXISTS product_images
  `
    )
    .then(() => {
      console.log('Table "product_images" dropped successfully');
    })
    .catch((error) => {
      console.log('Table "product_images" failed to dropped');
      console.error(error);
    });
};

module.exports = {
  up,
  down,
};
