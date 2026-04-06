exports.paginate = (page = 1, limit = 12) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

exports.paginateResponse = (data, total, page, limit) => ({
  data,
  pagination: {
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    limit: parseInt(limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1,
  },
});