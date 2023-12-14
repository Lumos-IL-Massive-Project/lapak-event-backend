const { validationResult } = require("express-validator");
const db = require("../config/db");
const { throwError } = require("../utils/throw-error");
const {
  filterQueries,
  prepareQueryParamValues,
} = require("../utils/query-helper");

const getAllCities = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const citiesTable = "cities";
    const provincesTable = "provinces";

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    let countQuery = `
      SELECT COUNT(*) AS total
      FROM ${citiesTable}
    `;

    let dataQuery = `
        SELECT 
          ${citiesTable}.id,
          ${citiesTable}.name AS city_name, 
          ${citiesTable}.province_id, 
          ${citiesTable}.type AS type, 
          ${citiesTable}.postal_code AS postal_code, 
          ${provincesTable}.id AS province_id, 
          ${provincesTable}.name AS province_name
        FROM ${citiesTable}
        JOIN ${provincesTable} ON ${citiesTable}.province_id = ${provincesTable}.id
      `;

    const filterColumn = ["province_id", "name"];
    const arrQueries = Object.keys(req.query);
    const filter = filterQueries({
      arrQueries,
      filterColumn,
      table: citiesTable,
    });
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
      const cityName = result.city_name;
      if (!acc[cityName]) {
        acc[cityName] = {
          id: result.id,
          name: cityName,
          province_id: result.province_id,
          type: result.type,
          postal_code: result.postal_code,
          province: {
            id: result.province_id,
            name: result.province_name,
          },
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

const getCityDetails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const citiesTable = "cities";
    const provincesTable = "provinces";
    const dataQuery = `
        SELECT 
          ${citiesTable}.id,
          ${citiesTable}.name AS city_name, 
          ${citiesTable}.province_id, 
          ${citiesTable}.type AS type, 
          ${citiesTable}.postal_code AS postal_code, 
          ${provincesTable}.id AS province_id, 
          ${provincesTable}.name AS province_name
        FROM ${citiesTable}
        JOIN ${provincesTable} ON ${citiesTable}.province_id = ${provincesTable}.id
        WHERE ${citiesTable}.id = ${req.params.id}
      `;

    db.query(dataQuery, (err, results) => {
      if (err) {
        console.error(err);
        throwError("Internal server error", 500);
      }

      const groupedResults = results.reduce((acc, result) => {
        const cityName = result.city_name;
        if (!acc[cityName]) {
          acc[cityName] = {
            id: result.id,
            name: cityName,
            province_id: result.province_id,
            type: result.type,
            postal_code: result.postal_code,
            province: {
              id: result.province_id,
              name: result.province_name,
            },
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
    });
  } catch (error) {
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const createCity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [cities] = await db
      .promise()
      .query(
        "INSERT INTO `cities`(`province_id`, `type`, `name`, `postal_code`) VALUES (?, ?, ?, ?)",
        [
          req.body.province_id,
          req.body.type,
          req.body.name,
          req.body.postal_code,
        ]
      );

    if (cities.affectedRows > 0) {
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

const updateCity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [cities] = await db
      .promise()
      .query(
        "UPDATE `cities` SET `province_id`=?,`type`=?,`name`=?,`postal_code`=? WHERE id =?",
        [
          req.body.province_id,
          req.body.type,
          req.body.name,
          req.body.postal_code,
          req.params.id,
        ]
      );

    if (cities.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Berhasil mengupdate data",
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

const deleteCity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [deleteCities] = await db
      .promise()
      .query("DELETE FROM `cities` WHERE id =?", [req.params.id]);

    if (deleteCities.affectedRows > 0) {
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
  getAllCities,
  getCityDetails,
  createCity,
  updateCity,
  deleteCity,
};
