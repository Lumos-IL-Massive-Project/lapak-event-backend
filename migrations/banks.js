const db = require("../config/db");

const up = () => {
  db.promise()
    .query(
      `
      CREATE TABLE IF NOT EXISTS banks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(30) NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );  
    `
    )
    .then(() => {
      console.log('Table "banks" created successfully');
    })
    .catch((error) => {
      console.log('Table "banks" failed to create');
      console.error(error);
    });
};

const down = () => {
  db.promise()
    .query(
      `
    DROP TABLE IF EXISTS banks
  `
    )
    .then(() => {
      console.log('Table "banks" dropped successfully');
    })
    .catch((error) => {
      console.log('Table "banks" failed to dropped');
      console.error(error);
    });
};

module.exports = {
  up,
  down,
};
