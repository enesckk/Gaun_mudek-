import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    // Settings identifier (singleton pattern - only one settings document)
    identifier: {
      type: String,
      default: "app_settings",
      unique: true,
    },
    
    // General Settings
    general: {
      appName: { type: String, default: "GAUN MEDEK" },
      language: { type: String, default: "tr" },
      timezone: { type: String, default: "Europe/Istanbul" },
      dateFormat: { type: String, default: "DD/MM/YYYY" },
      timeFormat: { type: String, default: "24h" }, // 12h or 24h
    },

    // UI/Display Settings
    display: {
      theme: { type: String, default: "light" }, // light, dark, auto
      itemsPerPage: { type: Number, default: 10 },
      showNotifications: { type: Boolean, default: true },
      compactMode: { type: Boolean, default: false },
    },

    // Exam/Assessment Settings
    exam: {
      defaultMaxScore: { type: Number, default: 100 },
      autoSave: { type: Boolean, default: true },
      showStudentNames: { type: Boolean, default: true },
      allowBatchUpload: { type: Boolean, default: true },
      defaultQuestionCount: { type: Number, default: 10 },
    },

    // AI/Gemini Settings
    ai: {
      geminiApiKey: { type: String, default: "" },
      enableAutoScoring: { type: Boolean, default: true },
      confidenceThreshold: { type: Number, default: 0.7 }, // 0-1
      maxRetries: { type: Number, default: 3 },
    },

    // Notification Settings
    notifications: {
      emailEnabled: { type: Boolean, default: false },
      emailAddress: { type: String, default: "" },
      notifyOnBatchComplete: { type: Boolean, default: true },
      notifyOnErrors: { type: Boolean, default: true },
    },

    // Advanced Settings
    advanced: {
      enableOpenCV: { type: Boolean, default: false },
      enablePdfPoppler: { type: Boolean, default: false },
      debugMode: { type: Boolean, default: false },
      logLevel: { type: String, default: "info" }, // debug, info, warn, error
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
SettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne({ identifier: "app_settings" });
  if (!settings) {
    settings = await this.create({ identifier: "app_settings" });
  }
  return settings;
};

export default mongoose.model("Settings", SettingsSchema);



