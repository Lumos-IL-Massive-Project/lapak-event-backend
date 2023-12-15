const db = require("../config/db");

const up = () => {
  db.promise()
    .query(
      `
      CREATE TABLE IF NOT EXISTS eo_registration_reject_reasons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        eo_registration_id INT NOT NULL,
        reason TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    `
    )
    .then(() => {
      console.log('Table "eo_registration_reject_reasons" created successfully');
    })
    .catch((error) => {
      console.log('Table "eo_registration_reject_reasons" failed to create');
      console.error(error);
    });
};

const down = () => {
  db.promise()
    .query(
      `
    DROP TABLE IF EXISTS eo_registration_reject_reasons
  `
    )
    .then(() => {
      console.log('Table "eo_registration_reject_reasons" dropped successfully');
    })
    .catch((error) => {
      console.log('Table "eo_registration_reject_reasons" failed to dropped');
      console.error(error);
    });
};

module.exports = {
  up,
  down,
};
