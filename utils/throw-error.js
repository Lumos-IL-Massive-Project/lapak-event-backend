const throwError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const returnError = (res, message, statusCode) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  throwError,
  returnError,
};