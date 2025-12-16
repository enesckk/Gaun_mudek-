import Settings from "../models/Settings.js";

// Get all settings
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error getting settings:", error);
    res.status(500).json({
      success: false,
      message: "Ayarlar alınamadı",
      error: error.message,
    });
  }
};

// Update settings
export const updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    
    // Get existing settings
    let settings = await Settings.findOne({ identifier: "app_settings" });
    
    if (!settings) {
      // Create new settings if doesn't exist
      settings = new Settings({ identifier: "app_settings" });
    }

    // Update nested objects
    if (updates.general) {
      settings.general = { ...settings.general, ...updates.general };
    }
    if (updates.display) {
      settings.display = { ...settings.display, ...updates.display };
    }
    if (updates.exam) {
      settings.exam = { ...settings.exam, ...updates.exam };
    }
    if (updates.ai) {
      // Don't expose API key in response
      const aiUpdates = { ...updates.ai };
      if (aiUpdates.geminiApiKey) {
        settings.ai.geminiApiKey = aiUpdates.geminiApiKey;
        delete aiUpdates.geminiApiKey; // Don't return it
      }
      settings.ai = { ...settings.ai, ...aiUpdates };
    }
    if (updates.notifications) {
      settings.notifications = { ...settings.notifications, ...updates.notifications };
    }
    if (updates.advanced) {
      settings.advanced = { ...settings.advanced, ...updates.advanced };
    }

    await settings.save();

    // Don't return sensitive data
    const responseSettings = settings.toObject();
    if (responseSettings.ai?.geminiApiKey) {
      responseSettings.ai.geminiApiKey = responseSettings.ai.geminiApiKey
        ? "***" + responseSettings.ai.geminiApiKey.slice(-4)
        : "";
    }

    res.json({
      success: true,
      message: "Ayarlar başarıyla kaydedildi",
      data: responseSettings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({
      success: false,
      message: "Ayarlar kaydedilemedi",
      error: error.message,
    });
  }
};

// Update specific section
export const updateSection = async (req, res) => {
  try {
    const { section } = req.params; // general, display, exam, ai, notifications, advanced
    const updates = req.body;

    let settings = await Settings.findOne({ identifier: "app_settings" });
    
    if (!settings) {
      settings = new Settings({ identifier: "app_settings" });
    }

    // Validate section
    const validSections = ["general", "display", "exam", "ai", "notifications", "advanced"];
    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: `Geçersiz bölüm: ${section}`,
      });
    }

    // Update the section
    if (section === "ai" && updates.geminiApiKey) {
      settings.ai.geminiApiKey = updates.geminiApiKey;
      delete updates.geminiApiKey;
    }
    
    settings[section] = { ...settings[section], ...updates };
    await settings.save();

    // Don't return sensitive data
    const responseSettings = settings.toObject();
    if (responseSettings.ai?.geminiApiKey) {
      responseSettings.ai.geminiApiKey = responseSettings.ai.geminiApiKey
        ? "***" + responseSettings.ai.geminiApiKey.slice(-4)
        : "";
    }

    res.json({
      success: true,
      message: `${section} ayarları başarıyla güncellendi`,
      data: responseSettings[section],
    });
  } catch (error) {
    console.error("Error updating section:", error);
    res.status(500).json({
      success: false,
      message: "Ayarlar güncellenemedi",
      error: error.message,
    });
  }
};

// Reset settings to default
export const resetSettings = async (req, res) => {
  try {
    await Settings.findOneAndDelete({ identifier: "app_settings" });
    const defaultSettings = await Settings.getSettings();
    
    res.json({
      success: true,
      message: "Ayarlar varsayılan değerlere sıfırlandı",
      data: defaultSettings,
    });
  } catch (error) {
    console.error("Error resetting settings:", error);
    res.status(500).json({
      success: false,
      message: "Ayarlar sıfırlanamadı",
      error: error.message,
    });
  }
};



