const { validationResult } = require("express-validator");
const fs = require("fs");
const db = require("../config/db");
const removeFile = require("../utils/remove-file");
const { throwError } = require("../utils/throw-error");
const {
  filterQueries,
  prepareQueryParamValues,
} = require("../utils/query-helper");

const getAllBanks = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    let countQuery = "SELECT COUNT(*) AS total FROM `banks`";
    let dataQuery = "SELECT * FROM `banks`";

    const filterColumn = ["name"];
    const arrQueries = Object.keys(req.query);
    const filter = filterQueries({
      arrQueries,
      filterColumn,
      table: "banks",
    });

    countQuery += filter;
    dataQuery += `
        ${filter}
        LIMIT ${pageSize}
        OFFSET ${offset}
      `;

    const [countResult, dataResult] = await Promise.all([
      new Promise((resolve, reject) => {
        db.query(
          countQuery,
          prepareQueryParamValues(req.query, filterColumn),
          (err, res) => {
            if (err) {
              reject(err);
            } else {
              resolve(res?.[0]?.total || 0);
            }
          }
        );
      }),
      new Promise((resolve, reject) => {
        db.query(
          dataQuery,
          prepareQueryParamValues(req.query, filterColumn),
          (err, res) => {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          }
        );
      }),
    ]);

    const totalPage = Math.ceil(countResult / pageSize);
    return res.json({
      success: true,
      message: "Berhasil mengambil data",
      data: dataResult,
      pagination: {
        current_page: page,
        prev_page: page > 1 ? page - 1 : null,
        next_page: page < totalPage ? page + 1 : null,
        total_data_per_page: dataResult?.length || 0,
        total_data: countResult,
      },
    });
  } catch (error) {
    return res.status(error?.statusCode || 500).json({
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
    return res.status(error?.statusCode || 500).json({
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
    return res.status(error?.statusCode || 500).json({
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
    return res.status(error?.statusCode || 500).json({
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
    return res.status(error?.statusCode || 500).json({
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
