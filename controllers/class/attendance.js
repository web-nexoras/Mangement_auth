const classSchema = require("../../models/classSchema");
const enrollmentSchema = require("../../models/enrollmentSchema");
const attendanceSchema = require("../../models/attendanceSchema");

const markAttendance = async (req, res) => {
  try {
    const { id: classId } = req.params;
    const { date, records } = req.body;

    if (!Array.isArray(records) || records.length === 0 || records.length > 1000) {
      return res.status(400).json({ success: false, message: "Provide between 1 and 1000 attendance records." });
    }
    if (records.some((record) => !record || typeof record !== "object")) {
      return res.status(400).json({ success: false, message: "Each attendance record must contain a student ID and status." });
    }

    const sessionDate = date ? new Date(date) : new Date();
    if (Number.isNaN(sessionDate.getTime())) {
      return res.status(400).json({ success: false, message: "Provide a valid attendance date." });
    }
    sessionDate.setUTCHours(0, 0, 0, 0);

    const normalizedRecords = records.map(({ studentId, status }) => ({
      studentId,
      status: typeof status === "string" ? status.toLowerCase() : status,
    }));
    const allowedStatuses = new Set(["present", "absent", "late"]);
    const studentIds = normalizedRecords.map((record) => String(record.studentId));
    if (
      normalizedRecords.some((record) => !record.studentId || !allowedStatuses.has(record.status)) ||
      new Set(studentIds).size !== studentIds.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Each student must appear once with status present, absent, or late.",
      });
    }

    const classItem = await classSchema.findById(classId).select("teacherId");
    if (!classItem) {
      return res.status(404).json({ success: false, message: "Class not found." });
    }
    const isAssignedTeacher = classItem.teacherId && classItem.teacherId.toString() === req.user._id;
    if (req.user.role !== "admin" && !isAssignedTeacher) {
      return res.status(403).json({ success: false, message: "Only the assigned teacher or an admin can mark attendance." });
    }

    const enrolled = await enrollmentSchema
      .find({ classId, studentId: { $in: studentIds } })
      .distinct("studentId");
    if (enrolled.length !== studentIds.length) {
      return res.status(400).json({ success: false, message: "Attendance can only be marked for enrolled students." });
    }

    const attendance = await attendanceSchema.findOneAndUpdate(
      { classId, sessionDate },
      { $set: { markedBy: req.user._id, records: normalizedRecords } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    return res.status(200).json({ success: true, message: "Attendance saved.", data: attendance });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid class or student ID." });
    }
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Attendance for this class and date is being updated. Retry." });
    }
    return res.status(500).json({ success: false, message: "Could not save attendance." });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const { id: classId } = req.params;
    const enrollment = await enrollmentSchema.findOne({ classId, studentId: req.user._id });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: "You are not enrolled in this class." });
    }

    const sessions = await attendanceSchema
      .find({ classId, "records.studentId": req.user._id })
      .select("sessionDate markedBy records")
      .populate("markedBy", "fullname")
      .sort({ sessionDate: -1 })
      .lean();

    const records = sessions.map((session) => ({
      sessionDate: session.sessionDate,
      status: session.records.find((record) => record.studentId.toString() === req.user._id).status,
      markedBy: session.markedBy,
    }));
    const totals = records.reduce(
      (result, record) => ({ ...result, [record.status]: result[record.status] + 1 }),
      { present: 0, absent: 0, late: 0 },
    );

    return res.status(200).json({ success: true, totals, count: records.length, data: records });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid class ID." });
    }
    return res.status(500).json({ success: false, message: "Could not retrieve attendance." });
  }
};

module.exports = { markAttendance, getMyAttendance };
