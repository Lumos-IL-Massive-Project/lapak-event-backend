const { validationResult } = require("express-validator");
const db = require("../config/db");
const { throwError } = require("../utils/throw-error");

const getAllProvinces = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [provinces] = await db.promise().query("SELECT * FROM `provinces`");

    return res.json({
      success: true,
      message: "Berhasil mengambil data",
      data: provinces,
    });
  } catch (error) {
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProvinceDetails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [provinceDetails] = await db
      .promise()
      .query("SELECT * FROM `provinces` WHERE id =?", [req.params.id]);

    if (provinceDetails.length > 0) {
      return res.json({
        success: true,
        message: "Berhasil mengambil data",
        data: provinceDetails[0],
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

const createProvince = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [province] = await db
      .promise()
      .query("INSERT INTO `provinces` (`name`) VALUES (?)", [req.body.name]);

    if (province.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Berhasil menambahkan data",
      });
    }

    throwError("Gagal menambahkan data", 400);
  } catch (error) {
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProvince = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [province] = await db
      .promise()
      .query("SELECT * FROM `provinces` WHERE id =?", [req.params.id]);

    if (!province.length) {
      throwError("Data tidak ditemukan", 404);
    }

    const [updateProvince] = await db
      .promise()
      .query("UPDATE `provinces` SET `name`=? WHERE id =?", [
        req.body.name,
        req.params.id,
      ]);

    if (updateProvince.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Data berhasil diupdate",
      });
    }

    throwError("Gagal mengupdate data", 400);
  } catch (error) {
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteProvince = async (req, res) => {
  try {
    const [province] = await db
      .promise()
      .query("SELECT * FROM `provinces` WHERE id =?", [req.params.id]);

    if (!province.length) {
      throwError("Data tidak ditemukan", 404);
    }

    const [deleteProvince] = await db
      .promise()
      .query("DELETE FROM `provinces` WHERE id =?", [req.params.id]);

    if (deleteProvince.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Data berhasil dihapus",
      });
    }

    throwError("Gagal menghapus data", 400);
  } catch (error) {
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllProvinces,
  getProvinceDetails,
  createProvince,
  updateProvince,
  deleteProvince,
};
