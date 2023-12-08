const { validationResult, check } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otplib = require("otplib");
const { sendOTP } = require("./email");
const db = require("../config/db");

const checkRegisteredEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg);
    }

    const [users] = await db
      .promise()
      .query("SELECT * FROM `users` WHERE email = ?", [req.body.email]);

    if (users.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Email terdaftar",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Email tidak terdaftar",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg);
    }

    const { email, password } = req.body;

    const [checkEmailResult] = await db
      .promise()
      .query("SELECT * FROM `users` WHERE email = ?", [email]);

    if (!checkEmailResult.length) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan",
      });
    }

    if (
      req.body.platform === "mobile" &&
      checkEmailResult[0].role === "admin"
    ) {
      return res.status(401).send({
        success: false,
        message: "Pengguna tidak ditemukan",
      });
    }

    const isAuthorized = await bcrypt.compare(
      password,
      checkEmailResult[0].password
    );

    if (!isAuthorized) {
      return res.status(400).send({
        success: false,
        message: "Password tidak sesuai",
      });
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
        .query("SELECT * FROM `users` WHERE email = ?", [email]);

      return res.send({
        success: true,
        message: "Berhasil masuk",
        data: users[0],
      });
    }
  } catch (e) {
    return res.status(500).send({
      success: false,
      message: e.message,
    });
  }
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg);
    }

    const { email, username, phone_number, password, confirmation_password } =
      req.body;

    if (password !== confirmation_password) {
      return res.status(400).send({
        success: false,
        message: "Password tidak sama!",
      });
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
      return res.status(409).send({
        success: false,
        message: "Email telah digunakan",
      });
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
      sendOTP({ otpCode: otp, username, emailDestination: email });

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

    return res.status(400).send({
      success: false,
      message: "Tidak berhasil mendaftar",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

const refreshOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg);
    }

    const { email } = req.body;

    const [checkEmailResult] = await db
      .promise()
      .query("SELECT * FROM `users` WHERE email = ?", [req.body.email]);

    if (!checkEmailResult.length) {
      return res.status(404).json({
        success: false,
        message: "Email tidak terdaftar",
      });
    }

    if (checkEmailResult[0].status === "active") {
      return res.status(409).send({
        success: false,
        message: "Tidak dapat mengirim kode OTP",
      });
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
      sendOTP({
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
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg);
    }

    const [checkEmailResult] = await db
      .promise()
      .query("SELECT * FROM `users` WHERE email = ?", [req.body.email]);

    if (!checkEmailResult.length) {
      return res.status(404).json({
        success: false,
        message: "Email tidak terdaftar",
      });
    }

    if (checkEmailResult[0].status === "active") {
      return res.status(409).send({
        success: false,
        message: "Email telah terdaftar!",
      });
    }

    if (checkEmailResult[0].otp !== req.body.otp) {
      return res.status(409).send({
        success: false,
        message: "Kode otp salah!",
      });
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

    return res.status(400).send({
      success: false,
      message: "Kode otp telah kadaluwarsa",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const [checkUser] = await db
      .promise()
      .query("SELECT * FROM `users` WHERE id =?", [req.params.id]);

    if (!checkUser.length) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan",
      });
    }

    if (checkUser[0].refresh_token !== req.body.refresh_token) {
      return res.status(400).json({
        success: false,
        message: "Refresh token salah!",
      });
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
        .query("SELECT * FROM `users` WHERE id = ?", [req.params.id]);

      return res.send({
        success: true,
        message: "Berhasil refresh token",
        data: users[0],
      });
    }
  } catch (error) {
    return res.status(500).send({
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
