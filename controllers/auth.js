const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otplib = require("otplib");
const { sendOTPEmail } = require("./email");
const db = require("../config/db");
const { throwError } = require("../utils/throw-error");

const checkRegisteredEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [users] = await db
      .promise()
      .query(
        "SELECT `id`, `name`, `email`, `phone_number`, `profile_image`, `role`, `status`, `token`, `refresh_token`, `created_at`, `updated_at` FROM `users` WHERE email = ?",
        [req.body.email]
      );

    if (users.length > 0) {
      if (req.body.platform === "mobile" && users[0].role === "admin") {
        throwError("Pengguna tidak ditemukan", 401);
      }

      const token = jwt.sign(
        { role: users[0].role, email: users[0].email },
        process.env.TOKEN_SECRET,
        {
          expiresIn: "1d",
        }
      );

      const refreshToken = jwt.sign(
        { role: users[0].role, email: users[0].email },
        process.env.TOKEN_SECRET,
        {
          expiresIn: "2d",
        }
      );

      const [updateRow] = await db
        .promise()
        .query(
          "UPDATE `users` SET `token`=?,`refresh_token`=? WHERE email = ?",
          [token, refreshToken, req.body.email]
        );

      if (updateRow.affectedRows > 0) {
        const [users] = await db
          .promise()
          .query(
            "SELECT `id`, `name`, `email`, `phone_number`, `profile_image`, `role`, `status`, `token`, `refresh_token`, `created_at`, `updated_at` FROM `users` WHERE email = ?",
            [req.body.email]
          );

        return res.status(200).json({
          success: true,
          message: "Email terdaftar",
          data: users[0],
        });
      }
    }

    throwError("Email tidak terdaftar", 404);
  } catch (error) {
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const { email, password } = req.body;

    const [checkEmailResult] = await db
      .promise()
      .query("SELECT * FROM `users` WHERE email = ?", [email]);

    if (!checkEmailResult.length) {
      throwError("Pengguna tidak ditemukan", 404);
    }

    if (checkEmailResult[0].status === "inactive") {
      const epoch = Math.floor(new Date().getTime() / 1000);
      const otp = otplib.authenticator.generate("lapak-event-otp", epoch);
      const otpExpiredDate = new Date();
      otpExpiredDate.setMinutes(otpExpiredDate.getMinutes() + 5);

      const [updateRow] = await db
        .promise()
        .query(
          "UPDATE `users` SET `otp`=?,`otp_expired_date`=? WHERE email = ?",
          [otp, otpExpiredDate, email]
        );

      if (updateRow.affectedRows > 0) {
        sendOTPEmail({
          otpCode: otp,
          username: checkEmailResult[0].name,
          emailDestination: email,
        });

        return res.status(200).json({
          success: true,
          message: "Berhasil mengirim kode OTP, silahkan cek email anda",
          data: {
            otp,
          },
        });
      }
    }

    if (
      req.body.platform === "mobile" &&
      checkEmailResult[0].role === "admin"
    ) {
      throwError("Pengguna tidak ditemukan", 401);
    }

    const isAuthorized = await bcrypt.compare(
      password,
      checkEmailResult[0].password
    );

    if (!isAuthorized) {
      throwError("Password tidak sesuai", 400);
    }

    const token = jwt.sign(
      { role: checkEmailResult[0].role, email: checkEmailResult[0].email },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    const refreshToken = jwt.sign(
      { role: checkEmailResult[0].role, email: checkEmailResult[0].email },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "2d",
      }
    );

    const [updateRow] = await db
      .promise()
      .query("UPDATE `users` SET `token`=?,`refresh_token`=? WHERE email = ?", [
        token,
        refreshToken,
        email,
      ]);

    if (updateRow.affectedRows > 0) {
      const [users] = await db
        .promise()
        .query(
          "SELECT `id`, `name`, `email`, `phone_number`, `profile_image`, `role`, `status`, `token`, `refresh_token`, `created_at`, `updated_at` FROM `users` WHERE email = ?",
          [email]
        );

      return res.send({
        success: true,
        message: "Berhasil masuk",
        data: users[0],
      });
    }
  } catch (error) {
    return res.status(error?.statusCode || 500).send({
      success: false,
      message: error.message,
    });
  }
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const { email, username, phone_number, password, confirmation_password } =
      req.body;

    if (password !== confirmation_password) {
      throwError("Password tidak sama!", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    const epoch = Math.floor(new Date().getTime() / 1000);
    const otp = otplib.authenticator.generate("lapak-event-otp", epoch);
    const otpExpiredDate = new Date();
    otpExpiredDate.setMinutes(otpExpiredDate.getMinutes() + 5);

    const [checkEmailResult] = await db
      .promise()
      .query("SELECT * FROM `users` WHERE email = ?", [req.body.email]);

    if (checkEmailResult.length > 0) {
      throwError("Email telah digunakan", 409);
    }

    const query = `
    INSERT INTO users (name, email, password, phone_number, role, status, otp, otp_expired_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const [insertRow] = await db
      .promise()
      .query(query, [
        username,
        email,
        encryptedPassword,
        phone_number,
        "user",
        "inactive",
        otp,
        otpExpiredDate,
      ]);

    if (insertRow.affectedRows > 0) {
      sendOTPEmail({ otpCode: otp, username, emailDestination: email });

      return res.status(200).send({
        success: true,
        message: "Kode OTP telah dikirimkan ke email, silahkan cek email anda",
        data: {
          email,
          username,
          password,
          otp,
        },
      });
    }

    throwError("Tidak berhasil mendaftar", 400);
  } catch (error) {
    return res.status(error?.statusCode || 500).send({
      success: false,
      message: error.message,
    });
  }
};

const refreshOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const { email } = req.body;

    const [checkEmailResult] = await db
      .promise()
      .query("SELECT * FROM `users` WHERE email = ?", [req.body.email]);

    if (!checkEmailResult.length) {
      throwError("Email tidak terdaftar", 404);
    }

    if (checkEmailResult[0].status === "active") {
      throwError("Tidak dapat mengirim kode OTP", 409);
    }

    const epoch = Math.floor(new Date().getTime() / 1000);
    const otp = otplib.authenticator.generate("lapak-event-otp", epoch);
    const otpExpiredDate = new Date();
    otpExpiredDate.setMinutes(otpExpiredDate.getMinutes() + 5);

    const [updateRow] = await db
      .promise()
      .query(
        "UPDATE `users` SET `otp`=?,`otp_expired_date`=? WHERE email = ?",
        [otp, otpExpiredDate, req.body.email]
      );

    if (updateRow.affectedRows > 0) {
      sendOTPEmail({
        otpCode: otp,
        username: checkEmailResult[0].name,
        emailDestination: email,
      });

      return res.status(200).json({
        success: true,
        message: "Berhasil mengirim kode OTP, silahkan cek email anda",
        data: {
          otp,
        },
      });
    }
  } catch (error) {
    return res.status(error?.statusCode || 500).send({
      success: false,
      message: error.message,
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [checkEmailResult] = await db
      .promise()
      .query("SELECT * FROM `users` WHERE email = ?", [req.body.email]);

    if (!checkEmailResult.length) {
      throwError("Email tidak terdaftar", 404);
    }

    if (checkEmailResult[0].status === "active") {
      throwError("Email telah terdaftar!", 409);
    }

    if (checkEmailResult[0].otp !== req.body.otp) {
      throwError("Kode otp salah!", 409);
    }

    const now = new Date();
    if (checkEmailResult[0].otp_expired_date >= now) {
      const [updateRow] = await db
        .promise()
        .query("UPDATE `users` SET `status`='active' WHERE email = ?", [
          req.body.email,
        ]);

      if (updateRow.affectedRows > 0) {
        return res.status(200).json({
          success: true,
          message:
            "Berhasil verifikasi email, silahkan login untuk dapat masuk ke aplikasi",
        });
      }
    }

    throwError("Kode otp telah kadaluwarsa", 400);
  } catch (error) {
    return res.status(error?.statusCode || 500).send({
      success: false,
      message: error.message,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError(errors.array()[0].msg, 400);
    }

    const [checkUser] = await db
      .promise()
      .query("SELECT * FROM `users` WHERE id =?", [req.params.id]);

    if (!checkUser.length) {
      throwError("Data tidak ditemukan", 404);
    }

    if (checkUser[0].refresh_token !== req.body.refresh_token) {
      throwError("Refresh token salah!", 400);
    }

    const token = jwt.sign(
      { role: checkUser[0].role, email: checkUser[0].email },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    const refreshToken = jwt.sign(
      { role: checkUser[0].role, email: checkUser[0].email },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "2d",
      }
    );

    const [updateRow] = await db
      .promise()
      .query("UPDATE `users` SET `token`=?, `refresh_token`=? WHERE id =?", [
        token,
        refreshToken,
        req.params.id,
      ]);

    if (updateRow.affectedRows > 0) {
      const [users] = await db
        .promise()
        .query(
          "SELECT `id`, `name`, `email`, `phone_number`, `profile_image`, `role`, `status`, `token`, `refresh_token`, `created_at`, `updated_at` FROM `users` FROM `users` WHERE id = ?",
          [req.params.id]
        );

      return res.send({
        success: true,
        message: "Berhasil refresh token",
        data: users[0],
      });
    }
  } catch (error) {
    return res.status(error?.statusCode || 500).send({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  checkRegisteredEmail,
  login,
  register,
  verifyOTP,
  refreshOTP,
  refreshToken,
};
