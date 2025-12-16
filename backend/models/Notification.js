import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "batch_complete",
        "error",
        "exam_completed",
        "student_added",
        "course_updated",
        "system_alert",
        "score_uploaded",
        "analysis_complete",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: null, // Optional link to related page
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}, // Additional data (examId, courseId, etc.)
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
NotificationSchema.index({ read: 1, createdAt: -1 });

export default mongoose.model("Notification", NotificationSchema);



