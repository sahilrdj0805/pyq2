import express from "express";
import {
  addSubject,
  getSubjects
} from "../controllers/subject.controller.js";

const router = express.Router();

router.post("/", addSubject);   // admin later
router.get("/", getSubjects);   // frontend dropdown

export default router;
