const { validationResult } = require("express-validator");
const fs = require("fs");
const db = require("../config/db");
const removeFile = require("../utils/remove-file");
const { throwError } = require("../utils/throw-error");

const getAllBanks = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [banks] = await db.promise().query("SELECT * FROM `banks`");

    return res.json({
      success: true,
      message: "Berhasil mengambil data",
      data: banks,
    });
  } catch (error) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const getBankDetails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [bankDetails] = await db
      .promise()
      .query("SELECT * FROM `banks` WHERE id =?", [req.params.id]);

    if (bankDetails.length > 0) {
      return res.json({
        success: true,
        message: "Berhasil mengambil data",
        data: bankDetails[0],
      });
    }

    throwError("Data tidak ditemukan", 404);
  } catch (error) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const createBank = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [bank] = await db
      .promise()
      .query(
        "INSERT INTO `banks` (`name`, `code`, `image_url`) VALUES (?, ?, ?)",
        [req.body.name, req.body.code, req.file.path]
      );

    if (bank.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Berhasil menambahkan data",
      });
    }

    throwError("Gagal menambahkan data", 400);
  } catch (error) {
    removeFile(req.file?.path);
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBank = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [bank] = await db
      .promise()
      .query("SELECT * FROM `banks` WHERE id =?", [req.params.id]);

    if (!bank.length) {
      throwError("Data tidak ditemukan", 404);
    }

    fs.unlink(bank[0].image_url, async (err) => {
      if (err) {
        console.error("Gagal menghapus gambar:", err);
        throwError("Gagal mengupdate data", 500);
      }

      const [updateBank] = await db
        .promise()
        .query(
          "UPDATE `banks` SET `name`=?,`code`=?,`image_url`=? WHERE id =?",
          [req.body.name, req.body.code, req.file.path, req.params.id]
        );

      if (updateBank.affectedRows > 0) {
        return res.json({
          success: true,
          message: "Data berhasil diupdate",
        });
      }

      throwError("Gagal mengupdate data", 400);
    });
  } catch (error) {
    removeFile(req.file?.path);
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteBank = async (req, res) => {
  try {
    const [bank] = await db
      .promise()
      .query("SELECT * FROM `banks` WHERE id =?", [req.params.id]);

    if (!bank.length) {
      throwError("Data tidak ditemukan", 404);
    }

    fs.unlink(bank[0].image_url, async (err) => {
      if (err) {
        console.error("Gagal menghapus gambar:", err);
        throwError("Gagal menghapus data", 500);
      }

      const [deleteBank] = await db
        .promise()
        .query("DELETE FROM `banks` WHERE id =?", [req.params.id]);

      if (deleteBank.affectedRows > 0) {
        return res.json({
          success: true,
          message: "Data berhasil dihapus",
        });
      }

      throwError("Gagal menghapus data", 400);
    });
  } catch (error) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllBanks,
  getBankDetails,
  createBank,
  updateBank,
  deleteBank,
};
