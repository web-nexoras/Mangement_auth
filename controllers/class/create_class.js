const classSchema = require("../../models/classSchema");


// -----------create class
const createClass = async (req, res) => {
  try {
    const { name, code, description, subjects } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Name and code are required.",
      });
    }

    const newClass = await classSchema.create({
      name,
      code,
      description,
      creatorId: req.user._id,
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
