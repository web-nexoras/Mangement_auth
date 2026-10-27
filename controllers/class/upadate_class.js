const classSchema = require("../../models/classSchema");
const userSchema = require("../../models/userSchema");

// -----------update class
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, subjects, teacherId } = req.body;

    const cls = await classSchema.findById(id);
    if (!cls) {
      return res.status(404).json({
        success: false,
        message: "Class not found.",
      });
    }

    if (name !== undefined) cls.name = name;
    if (code !== undefined) cls.code = code;
    if (description !== undefined) cls.description = description;
    if (subjects !== undefined) cls.subjects = subjects;
    if (teacherId !== undefined) {
      if (teacherId) {
        const teacher = await userSchema.findOne({
          _id: teacherId,
          role: "teacher",
          isApproved: true,
          isVerified: true,
        });
        if (!teacher) {
          return res.status(400).json({ success: false, message: "Select an approved teacher." });
        }
      }
      cls.teacherId = teacherId || null;
    }

    await cls.save();

    res.status(200).json({
      success: true,
      message: "Class updated successfully.",
      data: cls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating class.",
      error: error.message,
    });
  }
};



module.exports = {
  
  updateClass
};
