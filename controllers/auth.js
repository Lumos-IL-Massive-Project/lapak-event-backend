const login = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Berhasil",
  });
};

module.exports = {
  login
}