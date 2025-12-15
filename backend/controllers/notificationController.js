import Notification from "../models/Notification.js";

// Note: createNotification is exported for use in other controllers

// Get all notifications (with pagination)
export const getNotifications = async (req, res) => {
  try {
    const { limit = 50, unreadOnly = false } = req.query;
    
    const query = unreadOnly === "true" ? { read: false } : {};
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    const unreadCount = await Notification.countDocuments({ read: false });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Bildirimler yüklenemedi",
      error: error.message,
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Bildirim bulunamadı",
      });
    }

    res.json({
      success: true,
      message: "Bildirim okundu olarak işaretlendi",
      data: notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Bildirim güncellenemedi",
      error: error.message,
    });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });

    res.json({
      success: true,
      message: "Tüm bildirimler okundu olarak işaretlendi",
    });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({
      success: false,
      message: "Bildirimler güncellenemedi",
      error: error.message,
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Bildirim bulunamadı",
      });
    }

    res.json({
      success: true,
      message: "Bildirim silindi",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Bildirim silinemedi",
      error: error.message,
    });
  }
};

// Create notification (internal use - can be called from other controllers)
export const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

