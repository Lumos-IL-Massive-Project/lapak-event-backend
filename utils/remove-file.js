const fs = require("fs");

const removeFile = (path) => {
  fs.unlink(path, (err) => {
    if (err) {
      console.error("Gagal menghapus file:", err);
      throwError("Gagal menghapus file", 500);
    }
  });
};

module.exports = removeFile;