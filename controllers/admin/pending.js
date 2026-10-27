const userSchema = require("../../models/userSchema");

const getPendingUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 5));
    const skip = (page - 1) * limit;

    const filter = {
      isApproved: false,
      role: { $in: ["teacher", "student"] },
    };

    const total = await userSchema.countDocuments(filter);
    const pendingUsers = await userSchema
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "Pending users retrieved successfully.",
      data: {
        users: pendingUsers.map((user) => ({
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve pending users.",
      error: error.message,
    });
  }
};

module.exports = {
  getPendingUsers,
};
