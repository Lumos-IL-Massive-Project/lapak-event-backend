const { validationResult } = require("express-validator");
const db = require("../config/db");
const { throwError } = require("../utils/throw-error");
const removeFile = require("../utils/remove-file");
const {
  filterQueries,
  prepareQueryParamValues,
} = require("../utils/query-helper");

const getAllProductCategories = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    let countQuery = "SELECT COUNT(*) AS total FROM `product_categories`";
    let dataQuery = "SELECT * FROM `product_categories`";

    const filterColumn = ["name"];
    const arrQueries = Object.keys(req.query);
    const filter = filterQueries({
      arrQueries,
      filterColumn,
      table: "product_categories",
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

const getProductCategoryDetails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [productCategoryDetails] = await db
      .promise()
      .query("SELECT * FROM `product_categories` WHERE id =?", [req.params.id]);

    if (productCategoryDetails.length > 0) {
      return res.json({
        success: true,
        message: "Berhasil mengambil data",
        data: productCategoryDetails[0],
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

const createProductCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [productCategory] = await db
      .promise()
      .query(
        "INSERT INTO `product_categories` (`name`, `image_url`, `code`) VALUES (?, ?, ?)",
        [req.body.name, req.file.path, req.body.code]
      );

    if (productCategory.affectedRows > 0) {
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

const updateProductCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [productCategory] = await db
      .promise()
      .query("SELECT * FROM `product_categories` WHERE id =?", [req.params.id]);

    if (!productCategory.length) {
      throwError("Data tidak ditemukan", 404);
    }

    removeFile(productCategory?.[0]?.image_url);

    const [updateProductCategory] = await db
      .promise()
      .query(
        "UPDATE `product_categories` SET `name`=?,`image_url`=?,`code`=? WHERE id =?",
        [req.body.name, req.file.path, req.body.code, req.params.id]
      );

    if (updateProductCategory.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Data berhasil diupdate",
      });
    }

    throwError("Gagal mengupdate data", 400);
  } catch (error) {
    removeFile(req.file?.path);
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteProductCategory = async (req, res) => {
  try {
    const [productCategory] = await db
      .promise()
      .query("SELECT * FROM `product_categories` WHERE id =?", [req.params.id]);

    if (!productCategory.length) {
      throwError("Data tidak ditemukan", 404);
    }

    removeFile(productCategory?.[0]?.image_url);

    const [deleteProductCategory] = await db
      .promise()
      .query("DELETE FROM `product_categories` WHERE id =?", [req.params.id]);

    if (deleteProductCategory.affectedRows > 0) {
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
  getAllProductCategories,
  getProductCategoryDetails,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
};
