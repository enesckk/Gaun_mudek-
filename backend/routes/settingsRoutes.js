import express from "express";
import {
  getSettings,
  updateSettings,
  updateSection,
  resetSettings,
} from "../controllers/settingsController.js";

const router = express.Router();

// Get all settings
router.get("/", getSettings);

// Update all settings
router.put("/", updateSettings);

// Update specific section
router.put("/:section", updateSection);

// Reset to defaults
router.post("/reset", resetSettings);

export default router;



