const { validationResult } = require("express-validator");
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otplib = require("otplib");
const { sendUserLoginCredentialEmail } = require("./email");
const { throwError } = require("../utils/throw-error");
const removeFile = require("../utils/remove-file");
const {
  filterQueries,
  prepareQueryParamValues,
} = require("../utils/query-helper");

const getAllUsers = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    let countQuery = "SELECT COUNT(*) AS total FROM `users`";
    let dataQuery =
      "SELECT `id`, `name`, `email`, `phone_number`, `profile_image`, `role`, `status`, `otp`, `otp_expired_date`, `created_at`, `updated_at` FROM `users`";

    const filterColumn = ["name", "email", "phone_number"];
    const arrQueries = Object.keys(req.query);
    const filter = filterQueries({
      arrQueries,
      filterColumn,
      table: "users",
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

const getUserDetails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [userDetails] = await db
      .promise()
      .query(
        "SELECT `id`, `name`, `email`, `phone_number`, `profile_image`, `role`, `status`, `otp`, `otp_expired_date`, `created_at`, `updated_at` FROM `users` WHERE id =?",
        [req.params.id]
      );

    if (userDetails.length > 0) {
      return res.json({
        success: true,
        message: "Berhasil mengambil data",
        data: userDetails[0],
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

const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const { username, email, phone_number, role } = req.body;

    const [checkEmail] = await db
      .promise()
      .query("SELECT * FROM `users` WHERE email =?", [email]);

    if (checkEmail.length > 0) {
      throwError("Email telah digunakan", 409);
    }

    const password = `${Date.now()}`;
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    const epoch = Math.floor(new Date().getTime() / 1000);
    const otp = otplib.authenticator.generate("lapak-event-otp", epoch);
    const otpExpiredDate = new Date();

    const token = jwt.sign({ role, email }, process.env.TOKEN_SECRET, {
      expiresIn: "1d",
    });

    const refreshToken = jwt.sign({ role, email }, process.env.TOKEN_SECRET, {
      expiresIn: "2d",
    });

    const query =
      "INSERT INTO `users`(`name`, `email`, `phone_number`, `profile_image`, `role`, `status`, `otp`, `otp_expired_date`, `password`, `token`, `refresh_token`) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
    const [user] = await db
      .promise()
      .query(query, [
        username,
        email,
        phone_number,
        req.file.path,
        role,
        "active",
        otp,
        otpExpiredDate,
        encryptedPassword,
        token,
        refreshToken,
      ]);

    if (user.affectedRows > 0) {
      sendUserLoginCredentialEmail({ emailDestination: email, password });

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

const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const { username, phone_number, role } = req.body;

    const [checkUser] = await db
      .promise()
      .query("SELECT * FROM `users` WHERE id =?", [req.params.id]);

    if (!checkUser.length) {
      throwError("Data tidak ditemukan", 404);
    }

    if (checkUser[0].profile_image) {
      removeFile(checkUser?.[0]?.profile_image);
    }

    const query =
      "UPDATE `users` SET `name`=?,`phone_number`=?,`profile_image`=?,`role`=?,`status`=? WHERE id =?";
    const [user] = await db
      .promise()
      .query(query, [
        username,
        phone_number,
        req.file.path,
        role,
        "active",
        req.params.id,
      ]);

    if (user.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Berhasil mengupdate data",
      });
    }

    throwError("Gagal mengupdate data", 400);
  } catch (error) {
    removeFile(req?.file?.path);
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const [users] = await db
      .promise()
      .query("SELECT * FROM `users` WHERE id =?", [req.params.id]);

    if (!users.length) {
      throwError("Data tidak ditemukan", 404);
    }

    if (users[0].profile_image) {
      removeFile(users?.[0]?.profile_image);
    }

    const [deleteUser] = await db
      .promise()
      .query("DELETE FROM `users` WHERE id =?", [req.params.id]);

    if (deleteUser.affectedRows > 0) {
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
  getAllUsers,
  getUserDetails,
  createUser,
  updateUser,
  deleteUser,
};
