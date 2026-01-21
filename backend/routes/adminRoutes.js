import express from "express";
import {
  getPendingRequests,
  approveRequest,
  rejectRequest,
  adminUploadPYQ,
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllAdmins,
  createAdmin
} from "../controllers/uploadRequestController.js";
import { protect, adminOnly } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Upload route with proper middleware order
router.post("/upload-pyq", protect, adminOnly, upload.single("pdf"), adminUploadPYQ);

// Other routes with auth middleware
router.use(protect, adminOnly);
router.get("/pending", getPendingRequests);
router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/admins", getAllAdmins);
router.post("/admins", createAdmin);
router.delete("/users/:id", deleteUser);
router.put("/approve/:id", approveRequest);
router.put("/reject/:id", rejectRequest);

export default router;