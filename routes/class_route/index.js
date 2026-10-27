const express = require("express");
const router = express.Router();

// // ----------all routes
const cls = require("./create_cls");
const getCls = require("./get_cls");
const delCls = require("./del_cls");
const upCls = require("./update_cls");

const { authMiddleware } = require("../../middleware/authMiddleware");
const { requireApproved, requireAdmin, requireRole } = require("../../middleware/roleCheckMiddleware");
const { enrollInClass, getMyEnrollments } = require("../../controllers/class/enrollment");
const { markAttendance, getMyAttendance } = require("../../controllers/class/attendance");

router.use(authMiddleware, requireApproved);
router.use("/class", getCls);
router.post("/class/:id/enroll", requireRole("student"), enrollInClass);
router.get("/class/my-enrollments", requireRole("student"), getMyEnrollments);
router.post("/class/:id/attendance", requireRole("admin", "teacher"), markAttendance);
router.get("/class/:id/attendance/me", requireRole("student"), getMyAttendance);

router.use(requireAdmin);
router.use("/class", cls);
router.use("/class", delCls);
router.use("/class", upCls);

module.exports = router;
