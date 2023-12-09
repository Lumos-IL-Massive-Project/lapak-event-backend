const { validationResult } = require("express-validator");
const fs = require("fs");
const db = require("../config/db");

const getAllBanks = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg);
    }

    const [banks] = await db.promise().query("SELECT * FROM `banks`");

    return res.json({
      success: true,
      message: "Berhasil mengambil data",
      data: banks,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const getBankDetails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg);
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

    return res.status(404).json({
      success: false,
      message: "Data tidak ditemukan",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createBank = async (req, res) => {
  try {
    const [bank] = await db
      .promise()
      .query("INSERT INTO `banks` (`name`, `code`, `image_url`) VALUES (?, ?, ?)", [
        req.body.name,
        req.body.code,
        req.file.path,
      ]);

    if (bank.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Berhasil menambahkan data",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Gagal menambahkan data",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBank = async (req, res) => {
  try {
    const [bank] = await db
      .promise()
      .query("SELECT * FROM `banks` WHERE id =?", [req.params.id]);

    if (!bank.length) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan",
      });
    }

    fs.unlink(bank[0].image_url, async (err) => {
      if (err) {
        console.error("Gagal menghapus gambar:", err);
        return res.status(500).json({
          success: false,
          message: "Gagal mengupdate data",
        });
      }

      const [updateBank] = await db
        .promise()
        .query(
          "UPDATE `banks` SET `name`=?,`code`=?,`image_url`=? WHERE id =?",
          [req.body.name, req.body.code, req.file.path, req.params.id]
        );

      if (updateBank.affectedRows > 0) {
        res.json({
          success: true,
          message: "Data berhasil diupdate",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
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
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan",
      });
    }

    fs.unlink(bank[0].image_url, async (err) => {
      if (err) {
        console.error("Gagal menghapus gambar:", err);
        return res.status(500).json({
          success: false,
          message: "Gagal menghapus data",
        });
      }

      const [deleteBank] = await db
        .promise()
        .query("DELETE FROM `banks` WHERE id =?", [req.params.id]);

      if (deleteBank.affectedRows > 0) {
        res.json({
          success: true,
          message: "Data berhasil dihapus",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
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
