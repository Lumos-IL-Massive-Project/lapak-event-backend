const { validationResult } = require("express-validator");
const fs = require("fs");
const db = require("../config/db");

const getAllProductCategories = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg);
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
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const getProductCategoryDetails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg);
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

const createProductCategory = async (req, res) => {
  try {
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

const updateProductCategory = async (req, res) => {
  try {
    const [productCategory] = await db
      .promise()
      .query("SELECT * FROM `product_categories` WHERE id =?", [req.params.id]);

    if (!productCategory.length) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan",
      });
    }

    fs.unlink(productCategory[0].image_url, async (err) => {
      if (err) {
        console.error("Gagal menghapus gambar:", err);
        return res.status(500).json({
          success: false,
          message: "Gagal mengupdate data",
        });
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
    return res.status(500).json({
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
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan",
      });
    }

    fs.unlink(productCategory[0].image_url, async (err) => {
      if (err) {
        console.error("Gagal menghapus gambar:", err);
        return res.status(500).json({
          success: false,
          message: "Gagal menghapus data",
        });
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
    return res.status(500).json({
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
