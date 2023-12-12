const db = require("../config/db");

const up = () => {
  db.promise()
    .query(
      `
      CREATE TABLE cities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        province_id INT NOT NULL,
        type VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        postal_code VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );    
    `
    )
    .then(() => {
      console.log('Table "cities" created successfully');
    })
    .catch((error) => {
      console.log('Table "cities" failed to create');
      console.error(error);
    });
};

const down = () => {
  db.promise()
    .query(
      `
    DROP TABLE IF EXISTS cities
  `
    )
    .then(() => {
      console.log('Table "cities" dropped successfully');
    })
    .catch((error) => {
      console.log('Table "cities" failed to dropped');
      console.error(error);
    });
};

module.exports = {
  up,
  down,
};
