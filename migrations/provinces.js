const db = require("../config/db");

const up = () => {
  db.promise()
    .query(
      `
      CREATE TABLE IF NOT EXISTS provinces (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_id (id)
    );  
    `
    )
    .then(() => {
      console.log('Table "provinces" created successfully');
    })
    .catch((error) => {
      console.log('Table "provinces" failed to create');
      console.error(error);
    });
};

const down = () => {
  db.promise()
    .query(
      `
    DROP TABLE IF EXISTS provinces
  `
    )
    .then(() => {
      console.log('Table "provinces" dropped successfully');
    })
    .catch((error) => {
      console.log('Table "provinces" failed to dropped');
      console.error(error);
    });
};

module.exports = {
  up,
  down,
};
