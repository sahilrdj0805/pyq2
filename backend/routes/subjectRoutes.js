import express from "express";
import { getAllSubjects } from "../controllers/uploadRequestController.js";

const router = express.Router();

router.get("/", getAllSubjects);   // frontend dropdown

export default router;
