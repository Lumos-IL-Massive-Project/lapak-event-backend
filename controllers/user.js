const { validationResult } = require("express-validator");
const fs = require("fs");
const db = require("../config/db");

const getAllUsers = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg);
    }

    const [users] = await db.promise().query("SELECT * FROM `users`");

    return res.json({
      success: true,
      message: "Berhasil mengambil data",
      data: users,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg);
    }

    const [userDetails] = await db
      .promise()
      .query("SELECT * FROM `users` WHERE id =?", [req.params.id]);

    if (userDetails.length > 0) {
      return res.json({
        success: true,
        message: "Berhasil mengambil data",
        data: userDetails[0],
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

module.exports = {
  getAllUsers,
  getUserDetails,
};
