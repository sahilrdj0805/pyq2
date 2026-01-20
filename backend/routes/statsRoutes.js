import express from "express";
import { getDashboardStats, getRecentActivities } from "../controllers/statsController.js";
import { protect, adminOnly } from "../middlewares/auth.js";

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(adminOnly);

// GET /api/admin/stats - Get dashboard statistics
router.get("/stats", getDashboardStats);

// GET /api/admin/activities - Get recent activities
router.get("/activities", getRecentActivities);

export default router;