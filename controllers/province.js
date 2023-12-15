const { validationResult } = require("express-validator");
const db = require("../config/db");
const { throwError } = require("../utils/throw-error");
const {
  filterQueries,
  prepareQueryParamValues,
} = require("../utils/query-helper");

const getAllProvinces = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    let countQuery = "SELECT COUNT(*) AS total FROM `provinces`";
    let dataQuery = "SELECT * FROM `provinces`";

    const filterColumn = ["name"];
    const arrQueries = Object.keys(req.query);
    const filter = filterQueries({
      arrQueries,
      filterColumn,
      table: "provinces",
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
