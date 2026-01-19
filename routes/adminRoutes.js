import express from "express";
import {
  getPendingRequests,
  approveRequest,
  rejectRequest
} from "../controllers/uploadRequestController.js";
import { protect, adminOnly } from "../middlewares/auth.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

router.get("/pending", getPendingRequests);
router.put("/approve/:id", approveRequest);
router.put("/reject/:id", rejectRequest);

export default router;
