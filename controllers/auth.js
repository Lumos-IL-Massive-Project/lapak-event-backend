const models = require("../models");

const checkRegisteredEmail = async (req, res) => {
  try {
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
  return res.status(200).json({
    success: true,
    message: "Berhasil",
  });
};

module.exports = {
  checkRegisteredEmail,
  login,
};
