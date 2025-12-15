import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// Get all notifications
router.get("/", getNotifications);

// Mark notification as read
router.put("/:id/read", markAsRead);

// Mark all as read
router.put("/read-all", markAllAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

export default router;

