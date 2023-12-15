const db = require("../config/db");

const up = () => {
  db.promise()
    .query(
      `
      CREATE TABLE IF NOT EXISTS eo_registration_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        eo_registration_id INT DEFAULT NULL,
        document_name VARCHAR(50) DEFAULT NULL,
        document_url VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    `
    )
    .then(() => {
      console.log('Table "eo_registration_documents" created successfully');
    })
    .catch((error) => {
      console.log('Table "eo_registration_documents" failed to create');
      console.error(error);
    });
};

const down = () => {
  db.promise()
    .query(
      `
    DROP TABLE IF EXISTS eo_registration_documents
  `
    )
    .then(() => {
      console.log('Table "eo_registration_documents" dropped successfully');
    })
    .catch((error) => {
      console.log('Table "eo_registration_documents" failed to dropped');
      console.error(error);
    });
};

module.exports = {
  up,
  down,
};
