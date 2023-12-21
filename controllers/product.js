const { validationResult } = require("express-validator");
const db = require("../config/db");
const removeFile = require("../utils/remove-file");
const { throwError } = require("../utils/throw-error");
const {
  filterQueries,
  prepareQueryParamValues,
} = require("../utils/query-helper");

const getAllProducts = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    let countQuery = "SELECT COUNT(*) AS total FROM `products`";
    let dataQuery = `
      SELECT 
        products.*, 
        product_images.id AS product_image_id, 
        product_images.image_url,
        users.name AS user_name,
        users.email AS user_email,
        product_categories.name AS product_category_name
      FROM products 
      LEFT JOIN product_images ON products.id = product_images.product_id
      LEFT JOIN users ON products.user_id = users.id
      LEFT JOIN product_categories ON products.category_id = product_categories.id
    `;

    const filterColumn = ["user_id", "category_id", "name", "code"];
    const arrQueries = Object.keys(req.query);
    const filter = filterQueries({
      arrQueries,
      filterColumn,
      table: "products",
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
    const groupedResults = dataResult.reduce((acc, result) => {
      const id = result.id;
      if (!acc[id]) {
        acc[id] = {
          id,
          user_id: result.user_id,
          user: {
            id: result.user_id,
            name: result.user_name,
            email: result.user_email,
          },
          category_id: result.category_id,
          category: {
            id: result.category_id,
            name: result.product_category_name,
          },
          name: result.name,
          code: result.code,
          rating: result.rating,
          total_rating: result.total_rating,
          price: result.price,
          description: result.description,
          created_at: result.created_at,
          updated_at: result.updated_at,
          thumbnail: result.image_url,
        };
      }
      return acc;
    }, {});

    const finalResults = Object.values(groupedResults);

    res.json({
      success: true,
      message: "Berhasil mengambil data",
      data: finalResults,
      pagination: {
        current_page: page,
        prev_page: page > 1 ? page - 1 : null,
        next_page: page < totalPage ? page + 1 : null,
        total_data_per_page: finalResults?.length || 0,
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

const getProductDetails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    let dataQuery = `
      SELECT 
        products.*, 
        product_images.id AS product_image_id, 
        product_images.image_url 
      FROM products 
      LEFT JOIN product_images ON products.id = product_images.product_id
    `;

    const filterColumn = ["name", "code"];
    const arrQueries = Object.keys(req.query);
    const filter = filterQueries({
      arrQueries,
      filterColumn,
      table: "products",
    });

    dataQuery += filter;

    db.query(
      dataQuery,
      prepareQueryParamValues(req.query, filterColumn),
      (err, results) => {
        if (err) {
          console.error(err);
          throwError("Internal server error", 500);
        }

        const groupedResults = results.reduce((acc, result) => {
          const id = result.id;
          if (!acc[id]) {
            acc[id] = {
              id,
              user_id: result.user_id,
              user: {
                id: result.user_id,
                name: result.user_name,
                email: result.user_email,
              },
              category_id: result.category_id,
              category: {
                id: result.category_id,
                name: result.product_category_name,
              },
              name: result.name,
              code: result.code,
              rating: result.rating,
              total_rating: result.total_rating,
              price: result.price,
              description: result.description,
              created_at: result.created_at,
              updated_at: result.updated_at,
            };
          }
          return acc;
        }, {});

        const finalResults = Object.values(groupedResults);

        res.json({
          success: true,
          message: "Berhasil mengambil data",
          data: finalResults?.[0],
        });
      }
    );
  } catch (error) {
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const uploadTemporaryImage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [results] = await db
      .promise()
      .query("INSERT INTO `product_images`(`image_url`) VALUES (?)", [
        req.file?.path,
      ]);

    if (results.affectedRows > 0) {
      const [documents] = await db
        .promise()
        .query("SELECT `id`,`image_url` FROM `product_images` WHERE id = ?", [
          results.insertId,
        ]);

      if (documents.length > 0) {
        return res.json({
          success: true,
          message: "Berhasil mengunggah gambar",
          data: documents[0],
        });
      }
    }

    throwError("Gagal mengunggah gambar");
  } catch (error) {
    removeFile(req.file?.path);
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  await db.promise().beginTransaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const { user_id, category_id, name, price, description, images } = req.body;

    const [totalProduct, categoryResult] = await Promise.all([
      new Promise((resolve, reject) => {
        db.query(
          "SELECT COUNT(*) AS total_product FROM `products` WHERE category_id = ?",
          [category_id],
          (err, res) => {
            if (err) {
              reject(err);
            } else {
              resolve(res?.[0]?.total_product || 0);
            }
          }
        );
      }),
      new Promise((resolve, reject) => {
        db.query(
          "SELECT `code` FROM `product_categories` WHERE id = ?",
          [category_id],
          (err, res) => {
            if (err) {
              reject(err);
            } else {
              resolve(res?.[0]?.code || undefined);
            }
          }
        );
      }),
    ]);

    if (!categoryResult) {
      throwError("Kategori tidak ditemukan", 404);
    }

    const generatedCode = `${categoryResult}.${Number(totalProduct || 0) + 1}`;
    const [insertProduct] = await db
      .promise()
      .query(
        "INSERT INTO `products`(`user_id`, `category_id`, `name`, `code`, `price`, `description`) VALUES (?,?,?,?,?,?)",
        [user_id, category_id, name, generatedCode, price, description]
      );

    if (insertProduct.affectedRows > 0) {
      images.map(async (image) => {
        await db
          .promise()
          .query("UPDATE `product_images` SET `product_id`=? WHERE id = ?", [
            insertProduct.insertId,
            image.id,
          ]);
      });

      await db.promise().commit();
      return res.json({
        success: true,
        message: "Berhasil menambahkan data",
      });
    }

    throwError("Gagal menambahkan data", 400);
  } catch (error) {
    await db.promise().rollback();
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  await db.promise().beginTransaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const { user_id, category_id, name, price, description, images } = req.body;

    const [totalProduct, categoryResult] = await Promise.all([
      new Promise((resolve, reject) => {
        db.query(
          "SELECT COUNT(*) AS total_product FROM `products` WHERE category_id = ?",
          [category_id],
          (err, res) => {
            if (err) {
              reject(err);
            } else {
              resolve(res?.[0]?.total_product || 0);
            }
          }
        );
      }),
      new Promise((resolve, reject) => {
        db.query(
          "SELECT `code` FROM `product_categories` WHERE id = ?",
          [category_id],
          (err, res) => {
            if (err) {
              reject(err);
            } else {
              resolve(res?.[0]?.code || undefined);
            }
          }
        );
      }),
    ]);

    if (!categoryResult) {
      throwError("Kategori tidak ditemukan", 404);
    }

    const generatedCode = `${categoryResult}.${Number(totalProduct || 0) + 1}`;
    const [insertProduct] = await db
      .promise()
      .query(
        "UPDATE `products` SET `user_id`=?,`category_id`=?,`name`=?,`code`=?,`price`=?,`description`=? WHERE id = ?",
        [
          user_id,
          category_id,
          name,
          generatedCode,
          price,
          description,
          req.params.id,
        ]
      );

    if (insertProduct.affectedRows > 0) {
      images.map(async (image) => {
        await db
          .promise()
          .query("UPDATE `product_images` SET `product_id`=? WHERE id = ?", [
            insertProduct.insertId,
            image.id,
          ]);
      });

      await db.promise().commit();
      return res.json({
        success: true,
        message: "Berhasil menambahkan data",
      });
    }

    throwError("Gagal menambahkan data", 400);
  } catch (error) {
    await db.promise().rollback();
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteProductImage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [productImages] = await db
      .promise()
      .query("SELECT `image_url` FROM `product_images` WHERE id = ?", [
        req.params.id,
      ]);

    if (!productImages.length) {
      throwError("Data tidak ditemukan", 404);
    }

    removeFile(productImages?.[0]?.image_url);

    db.query(
      "DELETE FROM `product_images` WHERE id = ?",
      [req.params.id],
      (err, result) => {
        if (err) {
          throwError("Gagal menghapus data");
        }

        return res.json({
          success: true,
          message: "Berhasil menghapus data",
        });
      }
    );
  } catch (error) {
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  await db.promise().beginTransaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [productImages] = await db
      .promise()
      .query("SELECT `image_url` FROM `product_images` WHERE product_id = ?", [
        req.params.id,
      ]);

    if (!productImages.length) {
      throwError("Gambar tidak ditemukan", 404);
    }

    productImages.map((productImage) => {
      removeFile(productImage?.image_url);
    });

    await db
      .promise()
      .query("DELETE FROM `product_images` WHERE product_id = ?", [
        req.params.id,
      ]);
    await db
      .promise()
      .query("DELETE FROM `products` WHERE id = ?", [req.params.id]);

    await db.promise().commit();
    return res.json({
      success: true,
      message: "Berhasil menghapus data",
    });
  } catch (error) {
    await db.promise().rollback();
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  getProductDetails,
  uploadTemporaryImage,
  createProduct,
  updateProduct,
  deleteProductImage,
  deleteProduct,
};
