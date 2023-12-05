const { validationResult } = require("express-validator");
const models = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otplib = require("otplib");
const { sendOTP } = require("./email");

const checkRegisteredEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg);
    }

    const user = await models.User.findOne({
      where: { email: req.body.email },
    });

    if (user) {
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

    const user = await models.User.findOne({ where: { email } });
    if (!user) {
      throw new Error("Pengguna tidak ditemukan");
    }

    if (req.body.platform === "mobile" && user.role === "admin") {
      throw new Error("Pengguna tidak ditemukan");
    }

    const isAuthorized = await bcrypt.compare(password, user.password);

    if (!isAuthorized) {
      throw new Error("Password tidak sesuai");
    }

    const token = jwt.sign(
      { role: user.role, email: user.email },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "2d",
      }
    );

    await models.User.update(
      { token },
      {
        where: {
          email,
        },
      }
    );

    delete user["dataValues"]["password"];
    return res.send({
      success: true,
      message: "Berhasil masuk",
      data: { ...user.dataValues, token },
    });
  } catch (e) {
    return res.status(401).send({
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
      throw new Error("Password tidak sama!");
    }

    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    const epoch = Math.floor(new Date().getTime() / 1000);
    const otp = otplib.authenticator.generate("lapak-event-otp", epoch);
    const otpExpiredDate = new Date();
    otpExpiredDate.setMinutes(otpExpiredDate.getMinutes() + 5);

    const [exist, user] = await models.User.findOrCreate({
      where: { email },
      defaults: {
        name: username,
        password: encryptedPassword,
        phone_number,
        role: "user",
        status: "inactive",
        otp,
        otp_expired_date: otpExpiredDate,
      },
    });

    if (user) {
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

    if (exist) {
      return res.status(409).send({
        success: false,
        message: "Email telah digunakan",
      });
    }

    throw new Error("Tidak berhasil mendaftar");
  } catch (error) {
    return res.status(400).send({
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

    const user = await models.User.findOne({
      where: { email },
    });

    if (user) {
      if (user.status === "active") {
        throw new Error("Tidak dapat mengirim kode OTP");
      }

      const epoch = Math.floor(new Date().getTime() / 1000);
      const otp = otplib.authenticator.generate("lapak-event-otp", epoch);
      const otpExpiredDate = new Date();
      otpExpiredDate.setMinutes(otpExpiredDate.getMinutes() + 5);

      await user.update({ otp, otp_expired_date: otpExpiredDate });

      sendOTP({
        otpCode: otp,
        username: user.name,
        emailDestination: email,
      });

      return res.status(200).json({
        success: true,
        message: "Berhasil mengirim kode OTP, silahkan cek email anda",
        data: {
          otp,
        }
      });
    }

    return res.status(404).json({
      success: false,
      message: "Email tidak terdaftar",
    });
  } catch (error) {
    return res.status(400).send({
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

    const user = await models.User.findOne({
      where: { email: req.body.email },
    });

    if (user) {
      if (user.status === "active") {
        throw new Error("Email telah terdaftar!");
      }

      if (user.otp !== req.body.otp) {
        throw new Error("Kode otp salah!");
      }

      const now = new Date();

      if (user.otp_expired_date >= now) {
        await user.update({ status: "active" });

        return res.status(200).json({
          success: true,
          message:
            "Berhasil verifikasi email, silahkan login untuk dapat masuk ke aplikasi",
        });
      }

      throw new Error("Kode otp telah kadaluwarsa");
    }

    return res.status(404).json({
      success: false,
      message: "Email tidak terdaftar",
    });
  } catch (error) {
    return res.status(400).send({
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
};
