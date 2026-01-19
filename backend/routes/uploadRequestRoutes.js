import express from "express";
import upload from "../middlewares/upload.js";
import { createUploadRequest } from "../controllers/uploadRequestController.js";

const router = express.Router();

router.post(
  "/",
  upload.single("pdf"),
  createUploadRequest
);



export default router;
