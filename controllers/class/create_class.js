const classSchema = require("../../models/classSchema");
const userSchema = require("../../models/userSchema");


// -----------create class
const createClass = async (req, res) => {
  try {
    const { name, code, description, subjects, teacherId } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Name and code are required.",
      });
    }

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

    const newClass = await classSchema.create({
      name,
      code,
      description,
      creatorId: req.user._id,
      teacherId: teacherId || null,
      subjects: subjects || [],
    });

    res.status(201).json({
      success: true,
      message: "Class created successfully.",
      data: (newClass),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating class.",
      error: error.message,
    });
  }
};


module.exports = {
  
  createClass,

};
