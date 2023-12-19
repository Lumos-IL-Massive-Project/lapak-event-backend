const { validationResult } = require("express-validator");
const fs = require("fs");
const db = require("../config/db");
const removeFile = require("../utils/remove-file");
const { throwError } = require("../utils/throw-error");
const {
  filterQueries,
  prepareQueryParamValues,
} = require("../utils/query-helper");
const { sendEventOrganizerApprovalEmail } = require("./email");

const getAllEventOrganizerRegistrations = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    let countQuery = `
      SELECT COUNT(*) AS total FROM eo_registrations
      LEFT JOIN users ON eo_registrations.user_id = users.id
    `;
    let dataQuery = `
      SELECT 
        eo_registrations.id, 
        eo_registrations.user_id, 
        eo_registrations.company_name, 
        eo_registrations.company_owner_name, 
        eo_registrations.eo_name, 
        eo_registrations.status, 
        eo_registrations.created_at,
        eo_registrations.updated_at,
        users.name AS user_name, 
        users.email AS user_email 
      FROM eo_registrations
      LEFT JOIN users ON eo_registrations.user_id = users.id
    `;

    const filterColumn = ["company_name", "company_owner_name", "eo_name"];
    const arrQueries = Object.keys(req.query);
    const filter = filterQueries({
      arrQueries,
      filterColumn,
      table: "eo_registrations",
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
          company_name: result.company_name,
          company_owner_name: result.company_owner_name,
          eo_name: result.eo_name,
          status: result.status,
          user: {
            id: result.user_id,
            name: result.user_name,
            email: result.user_email,
          },
          created_at: result.created_at,
          updated_at: result.updated_at,
        };
      }
      return acc;
    }, {});

    const finalResults = Object.values(groupedResults);

    return res.json({
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

const getEventOrganizerRegistrationDetails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const dataQuery = `
        SELECT
          eo_registrations.*,
          users.name AS user_name,
          users.email AS user_email,
          provinces.name AS province_name,
          cities.name AS city_name,
          cities.type AS city_type,
          cities.postal_code AS city_postal_code,
          product_categories.id AS product_category_id,
          product_categories.name AS product_category_name,
          eo_registration_documents.id AS document_id,
          eo_registration_documents.document_name,
          eo_registration_documents.document_url
        FROM eo_registrations
        LEFT JOIN users ON eo_registrations.user_id = users.id
        LEFT JOIN provinces ON eo_registrations.province_id = provinces.id
        LEFT JOIN cities ON eo_registrations.city_id = cities.id
        LEFT JOIN product_categories ON eo_registrations.product_category_id = product_categories.id
        LEFT JOIN eo_registration_documents ON eo_registrations.id = eo_registration_documents.eo_registration_id
        WHERE eo_registrations.id = ${req.params.id}
      `;

    db.query(dataQuery, (err, results) => {
      if (err) {
        console.error(err);
        throwError("Internal server error", 500);
      }

      const groupedResults = results.reduce((acc, result) => {
        const id = result.id;
        if (!acc[id]) {
          acc[id] = {
            id,
            company_name: result.company_name,
            company_owner_name: result.company_owner_name,
            eo_name: result.eo_name,
            npwp: result.npwp,
            bio: result.bio,
            product_category_id: result.product_category_id,
            country: result.country,
            province_id: result.province_id,
            city_id: result.city_id,
            postal_code: result.postal_code,
            office_address: result.office_address,
            website_url: result.website_url,
            instagram_profile_url: result.instagram_profile_url,
            facebook_profile_url: result.facebook_profile_url,
            linkedin_profile_url: result.linkedin_profile_url,
            status: result.status,
            user: {
              id: result.user_id,
              name: result.user_name,
              email: result.user_email,
            },
            province: {
              id: result.province_id,
              name: result.province_name,
            },
            city: {
              id: result.city_id,
              name: result.city_name,
              type: result.city_type,
              postal_code: result.postal_code,
            },
            product_category: {
              id: result.product_category_id,
              name: result.product_category_name,
            },
            documents: [],
            created_at: result.created_at,
            updated_at: result.updated_at,
          };
        }

        if (result.document_name) {
          acc[id].documents.push({
            id: result.document_id,
            document_name: result.document_name,
            document_url: result.document_url,
          });
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

const uploadTemporaryDocument = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [results] = await db
      .promise()
      .query(
        "INSERT INTO `eo_registration_documents`(`document_url`) VALUES (?)",
        [req.file?.path]
      );

    if (results.affectedRows > 0) {
      const [documents] = await db
        .promise()
        .query(
          "SELECT `id`,`document_url` FROM `eo_registration_documents` WHERE id = ?",
          [results.insertId]
        );

      if (documents.length > 0) {
        return res.json({
          success: true,
          message: "Berhasil mengunggah dokumen",
          data: documents[0],
        });
      }
    }

    throwError("Gagal mengunggah dokumen");
  } catch (error) {
    removeFile(req.file?.path);
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const registerEventOrganizer = async (req, res) => {
  await db.promise().beginTransaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const {
      company_name,
      company_owner_name,
      eo_name,
      npwp,
      bio,
      product_category_id,
      country,
      province_id,
      city_id,
      postal_code,
      office_address,
      website_url,
      instagram_profile_url,
      facebook_profile_url,
      linkedin_profile_url,
      documents,
    } = req.body;

    const [eoRegistrations] = await db
      .promise()
      .query(
        "INSERT INTO `eo_registrations`(`user_id`, `company_name`, `company_owner_name`, `eo_name`, `npwp`, `bio`, `product_category_id`, `country`, `province_id`, `city_id`, `postal_code`, `office_address`, `website_url`, `instagram_profile_url`, `facebook_profile_url`, `linkedin_profile_url`, `status`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [
          req.body.user_id,
          company_name,
          company_owner_name,
          eo_name,
          npwp,
          bio,
          product_category_id,
          country,
          province_id,
          city_id,
          postal_code,
          office_address,
          website_url,
          instagram_profile_url,
          facebook_profile_url,
          linkedin_profile_url,
          "pending",
        ]
      );

    if (eoRegistrations.affectedRows > 0) {
      for (const index in documents) {
        await db
          .promise()
          .query(
            "UPDATE `eo_registration_documents` SET `eo_registration_id`=?,`document_name`=?,`document_url`=? WHERE id = ?",
            [
              eoRegistrations.insertId,
              documents[index].name,
              documents[index].url,
              documents[index].id,
            ]
          );
      }
    }

    await db.promise().commit();
    res.json({
      success: true,
      message:
        "Berhasil mendaftar, silahkan tunggu untuk beberapa saat. Kami akan segera mengecek berkas-berkas Anda",
    });
  } catch (error) {
    await db.promise().rollback();
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const registerApprovalAction = async (req, res) => {
  await db.promise().beginTransaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const { status, reasons } = req.body;

    const [eoRegistrations] = await db
      .promise()
      .query("UPDATE `eo_registrations` SET `status`=? WHERE id = ?", [
        status,
        req.params.id,
      ]);

    if (eoRegistrations.affectedRows > 0) {
      const [users] = await db
        .promise()
        .query(
          "SELECT eo_registrations.id AS eo_registrations_id, users.id AS users_id, users.email AS email FROM `eo_registrations` RIGHT JOIN users ON eo_registrations.user_id = users.id WHERE eo_registrations.id = ?",
          [req.params.id]
        );

      if (users.length > 0) {
        if (status === "rejected") {
          for (const index in reasons) {
            await db
              .promise()
              .query(
                "INSERT INTO `eo_registration_reject_reasons`(`eo_registration_id`, `reason`) VALUES (?,?)",
                [req.params.id, reasons[index]]
              );
          }
        } else {
          await db
            .promise()
            .query("UPDATE `users` SET `role`=? WHERE id = ?", [
              "event organizer",
              users[0].users_id,
            ]);
        }

        sendEventOrganizerApprovalEmail({
          emailDestination: users[0].email,
          status,
          rejectionReasons: status === "approved" ? [] : reasons,
        });
      }

      await db.promise().commit();
      return res.json({
        success: true,
        message: `Berhasil ${status === "approved" ? "disetujui" : "ditolak"}`,
      });
    }

    throwError("Gagal melakukan persetujuan", 400);
  } catch (error) {
    await db.promise().rollback();
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllEventOrganizerRegistrations,
  getEventOrganizerRegistrationDetails,
  uploadTemporaryDocument,
  registerEventOrganizer,
  registerApprovalAction,
};
