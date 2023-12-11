const { validationResult } = require("express-validator");
const fs = require("fs");
const db = require("../config/db");
const { throwError } = require("../utils/throw-error");
const removeFile = require("../utils/remove-file");

const getAllProductCategories = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [productCategories] = await db
      .promise()
      .query("SELECT * FROM `product_categories`");

    return res.json({
      success: true,
      message: "Berhasil mengambil data",
      data: productCategories,
    });
  } catch (error) {
    return res.status(error.statusCode).json({
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
    return res.status(error.statusCode).json({
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
        "INSERT INTO `product_categories` (`name`, `image_url`) VALUES (?, ?)",
        [req.body.name, req.file.path]
      );

    if (productCategory.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Berhasil menambahkan data",
      });
    }

    throwError("Gagal menambahkan data", 400);
  } catch (error) {
    removeFile(req.file.path);
    return res.status(error.statusCode).json({
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

    fs.unlink(productCategory[0].image_url, async (err) => {
      if (err) {
        console.error("Gagal menghapus gambar:", err);
        throwError("Gagal mengupdate data", 500);
      }

      const [updateProductCategory] = await db
        .promise()
        .query(
          "UPDATE `product_categories` SET `name`=?,`image_url`=? WHERE id =?",
          [req.body.name, req.file.path, req.params.id]
        );

      if (updateProductCategory.affectedRows > 0) {
        res.json({
          success: true,
          message: "Data berhasil diupdate",
        });
      }
    });
  } catch (error) {
    removeFile(req.file.path);
    return res.status(error.statusCode).json({
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

    fs.unlink(productCategory[0].image_url, async (err) => {
      if (err) {
        console.error("Gagal menghapus gambar:", err);
        throwError("Gagal menghapus data", 500);
      }

      const [deleteProductCategory] = await db
        .promise()
        .query("DELETE FROM `product_categories` WHERE id =?", [req.params.id]);

      if (deleteProductCategory.affectedRows > 0) {
        res.json({
          success: true,
          message: "Data berhasil dihapus",
        });
      }
    });
  } catch (error) {
    return res.status(error.statusCode).json({
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
