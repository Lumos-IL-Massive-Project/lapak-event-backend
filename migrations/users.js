const db = require("../config/db");

const up = () => {
  db.promise()
    .query(
      `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone_number VARCHAR(255) NOT NULL,
        profile_image VARCHAR(255),
        role ENUM('user', 'admin', 'event organizer') DEFAULT 'user',
        status ENUM('active', 'inactive') DEFAULT 'inactive',
        otp VARCHAR(6) DEFAULT NULL,
        otp_expired_date DATETIME DEFAULT NULL,
        password VARCHAR(255) NOT NULL,
        token TEXT DEFAULT NULL,
        refresh_token TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );  
    `
    )
    .then(() => {
      console.log('Table "users" created successfully');
    })
    .catch((error) => {
      console.log('Table "users" failed to create');
      console.error(error);
    })
    .finally(() => {
      db.end();
    });
};

const down = () => {
  db.promise()
    .query(
      `
    DROP TABLE IF EXISTS users
  `
    )
    .then(() => {
      console.log('Table "users" dropped successfully');
    })
    .catch((error) => {
      console.log('Table "users" failed to dropped');
      console.error(error);
    })
    .finally(() => {
      db.end();
    });
};

module.exports = {
  up,
  down,
};
