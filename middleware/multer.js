const multer = require("multer");
const fs = require("fs");

const createStorage = (storageName) => {
  const destinationFolderPath = `documents/${storageName}`;

  if (!fs.existsSync(destinationFolderPath)) {
    fs.mkdirSync(destinationFolderPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destinationFolderPath);
    },
    filename: function (req, file, cb) {
      const extension = file.originalname.split(".")[1];
      cb(null, `${Date.now()}-${storageName}.${extension}`);
    },
  });

  return storage;
};

const uploadProductCategoryImage = multer({
  storage: createStorage("product-categories"),
});
const uploadBankImage = multer({
  storage: createStorage("banks"),
});
const uploadUserProfileImage = multer({
  storage: createStorage("profiles"),
});
const uploadEventOrganizerRegistrationDocument = multer({
  storage: createStorage("eo-registrations"),
});

module.exports = {
  uploadProductCategoryImage,
  uploadBankImage,
  uploadUserProfileImage,
  uploadEventOrganizerRegistrationDocument
};
