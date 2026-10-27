const classSchema = require("../../models/classSchema");
const enrollmentSchema = require("../../models/enrollmentSchema");

const enrollInClass = async (req, res) => {
  try {
    const classItem = await classSchema.findById(req.params.id).select("_id name code");
    if (!classItem) {
      return res.status(404).json({ success: false, message: "Class not found." });
    }

    const enrollment = await enrollmentSchema.create({
      classId: classItem._id,
      studentId: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Enrolled in class successfully.",
      data: enrollment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "You are already enrolled in this class." });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid class ID." });
    }
    return res.status(500).json({ success: false, message: "Could not enroll in class." });
  }
};

const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await enrollmentSchema
      .find({ studentId: req.user._id })
      .populate({ path: "classId", populate: { path: "subjects" } })
      .sort({ enrolledAt: -1 });

    return res.status(200).json({ success: true, count: enrollments.length, data: enrollments });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Could not retrieve enrollments." });
  }
};

module.exports = { enrollInClass, getMyEnrollments };
