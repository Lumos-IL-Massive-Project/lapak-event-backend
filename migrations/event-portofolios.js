const db = require("../config/db");

const up = () => {
  db.promise()
    .query(
      `
      CREATE TABLE IF NOT EXISTS event_portfolios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        event_date DATE NOT NULL,
        document_path VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );    
    `
    )
    .then(() => {
      console.log('Table "event_portfolios" created successfully');
    })
    .catch((error) => {
      console.log('Table "event_portfolios" failed to create');
      console.error(error);
    });
};

const down = () => {
  db.promise()
    .query(
      `
    DROP TABLE IF EXISTS event_portfolios
  `
    )
    .then(() => {
      console.log('Table "event_portfolios" dropped successfully');
    })
    .catch((error) => {
      console.log('Table "event_portfolios" failed to dropped');
      console.error(error);
    });
};

module.exports = {
  up,
  down,
};
