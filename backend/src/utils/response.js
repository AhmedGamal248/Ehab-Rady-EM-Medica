exports.success = (res, data, message = "تمت العملية بنجاح", statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

exports.error = (res, message = "حصل خطأ", statusCode = 500, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
};