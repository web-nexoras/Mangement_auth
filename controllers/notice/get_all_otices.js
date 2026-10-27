const noticeSchema = require("../../models/noticeSchema");


 const getAllNotices = async (req, res) => {
  try {
    const notices = await noticeSchema.find()
      .populate("createdBy", "fullname email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = { getAllNotices };
