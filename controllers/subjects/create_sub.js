const subjectSchema = require("../../models/subjectSchema");


// ---------create subject
const createSubject = async (req, res) => {
  const { subjectName, code, credits, description } = req.body;

  try {
    if (!subjectName || !code || credits === undefined || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Subject Name, Code, Credits, and Description are required fields.",
      });
    }

    const existingSubject = await subjectSchema.findOne({ code });
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: "A subject with this code already exists.",
      });
    }

    const newSubject = await subjectSchema.create({
      creatorId: req.user._id,
      subjectName,
      code,
      credits,
      description,
    });
    return res.status(201).json({
      success: true,
      message: "Subject created successfully.",
      data: newSubject,
    });
  } catch (error) {
    console.error("Error creating subject:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};



module.exports = {
  createSubject
};
