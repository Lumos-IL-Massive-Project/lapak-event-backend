const db = require("../config/db");

const up = () => {
  db.promise()
    .query(
      `
      CREATE TABLE IF NOT EXISTS eo_registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        company_name VARCHAR(100) NOT NULL,
        company_owner_name VARCHAR(100) NOT NULL,
        eo_name VARCHAR(100) NOT NULL,
        npwp VARCHAR(20) NOT NULL,
        bio TEXT NOT NULL,
        product_category_id INT NOT NULL,
        country VARCHAR(50) NOT NULL,
        province_id INT NOT NULL,
        city_id INT NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        office_address TEXT NOT NULL,
        website_url VARCHAR(255) DEFAULT NULL,
        instagram_profile_url VARCHAR(255) DEFAULT NULL,
        facebook_profile_url VARCHAR(255) DEFAULT NULL,
        linkedin_profile_url VARCHAR(255) DEFAULT NULL,
        status ENUM('pending', 'rejected', 'approved') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    `
    )
    .then(() => {
      console.log('Table "eo_registrations" created successfully');
    })
    .catch((error) => {
      console.log('Table "eo_registrations" failed to create');
      console.error(error);
    });
};

const down = () => {
  db.promise()
    .query(
      `
    DROP TABLE IF EXISTS eo_registrations
  `
    )
    .then(() => {
      console.log('Table "eo_registrations" dropped successfully');
    })
    .catch((error) => {
      console.log('Table "eo_registrations" failed to dropped');
      console.error(error);
    });
};

module.exports = {
  up,
  down,
};
