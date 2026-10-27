const noticeSchema = require("../../models/noticeSchema");


// ---------get single notice
const getSingleNotice = async (req, res) => {
  const { id } = req.params;

  try {
    const notice = await noticeSchema
      .findById(id)
      .populate("createdBy", "fullname email");

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.status(200).json({
      success: true,
      notice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = { getSingleNotice };
