const express = require("express");
const router = express.Router();

// ----------all routes
const createNotice = require("./create");
const getAllNotice = require("./get_all");
const editsNotice = require("./edit");
const deletesNotice = require("./delete");
const dislikeNoticce = require("./dislike");
const likeNotice = require("./like");
const singleNotice = require("./single");

// ------middleware
const { authMiddleware } = require("../../middleware/authMiddleware");
const { requireAdmin } = require("../../middleware/roleCheckMiddleware");


router.use("/notice", authMiddleware, requireAdmin, createNotice);
router.use("/notice", getAllNotice);
router.use("/notice", singleNotice);
router.use("/notice", authMiddleware, requireAdmin, editsNotice);
router.use("/notice", authMiddleware, requireAdmin, deletesNotice);
router.use("/notice", authMiddleware, likeNotice);
router.use("/notice", authMiddleware, dislikeNoticce);

module.exports = router;
