"use client";

import { useEffect, useState } from "react";
import { Settings, Save, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
// Using native select instead of complex Select component
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import apiClient from "@/lib/api/apiClient";

interface AppSettings {
  general: {
    appName: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
  };
  display: {
    theme: string;
    itemsPerPage: number;
    showNotifications: boolean;
    compactMode: boolean;
  };
  exam: {
    defaultMaxScore: number;
    autoSave: boolean;
    showStudentNames: boolean;
    allowBatchUpload: boolean;
    defaultQuestionCount: number;
  };
  ai: {
    geminiApiKey: string;
    enableAutoScoring: boolean;
    confidenceThreshold: number;
    maxRetries: number;
  };
  notifications: {
    emailEnabled: boolean;
    emailAddress: string;
    notifyOnBatchComplete: boolean;
    notifyOnErrors: boolean;
  };
  advanced: {
    enableOpenCV: boolean;
    enablePdfPoppler: boolean;
    debugMode: boolean;
    logLevel: string;
  };
}

export default function DashboardSettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    loadSettings();
  }, []);

  // Apply theme when settings change
  useEffect(() => {
    if (settings?.display.theme) {
      applyTheme(settings.display.theme);
    }
  }, [settings?.display.theme]);

  const applyTheme = (theme: string) => {
    if (typeof window === "undefined") return;
    
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else if (theme === "auto") {
      // Auto theme based on system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      localStorage.setItem("theme", "auto");
    }
  };

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/settings");
      setSettings(response.data.data);
      setHasChanges(false);
    } catch (error: any) {
      console.error("Error loading settings:", error);
      // If settings don't exist, create default
      if (error.response?.status === 404) {
        const defaultSettings: AppSettings = {
          general: {
            appName: "",
            timezone: "Europe/Istanbul",
            dateFormat: "DD/MM/YYYY",
            timeFormat: "24h",
          },
          display: {
            theme: "light",
            itemsPerPage: 10,
            showNotifications: true,
            compactMode: false,
          },
          exam: {
            defaultMaxScore: 100,
            autoSave: true,
            showStudentNames: true,
            allowBatchUpload: true,
            defaultQuestionCount: 10,
          },
          ai: {
            geminiApiKey: "",
            enableAutoScoring: true,
            confidenceThreshold: 0.7,
            maxRetries: 3,
          },
          notifications: {
            emailEnabled: false,
            emailAddress: "",
            notifyOnBatchComplete: true,
            notifyOnErrors: true,
          },
          advanced: {
            enableOpenCV: false,
            enablePdfPoppler: false,
            debugMode: false,
            logLevel: "info",
          },
        };
        setSettings(defaultSettings);
      } else {
        toast.error("Ayarlar yüklenemedi");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (section: keyof AppSettings, field: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value,
      },
    });
    setHasChanges(true);
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      await apiClient.put("/settings", settings);
      toast.success("Ayarlar başarıyla kaydedildi");
      setHasChanges(false);
      
      // Apply theme immediately after saving
      if (settings.display.theme) {
        applyTheme(settings.display.theme);
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error("Ayarlar kaydedilemedi: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = async () => {
    if (!confirm("Tüm ayarlar varsayılan değerlere sıfırlanacak. Emin misiniz?")) {
      return;
    }

    try {
      setIsSaving(true);
      await apiClient.post("/settings/reset");
      toast.success("Ayarlar sıfırlandı");
      await loadSettings();
    } catch (error: any) {
      console.error("Error resetting settings:", error);
      toast.error("Ayarlar sıfırlanamadı");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!settings) {
    return <div>Ayarlar yüklenemedi</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          
          <p className="text-muted-foreground">
            Uygulama ayarlarını yönetin ve özelleştirin
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={loadSettings}>
              İptal
            </Button>
          )}
          <Button
            onClick={saveSettings}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-foreground" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4 text-foreground" />
                Kaydet
              </>
            )}
          </Button>
          <Button variant="outline" onClick={resetSettings} disabled={isSaving}>
            <RotateCcw className="mr-2 h-4 w-4 text-foreground" />
            Sıfırla
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="display">Görünüm</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Genel Ayarlar</CardTitle>
              <CardDescription>Uygulama genel ayarları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Zaman Dilimi</Label>
                <Input
                  value={settings.general.timezone}
                  onChange={(e) => updateSetting("general", "timezone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Tarih Formatı</Label>
                <select
                  value={settings.general.dateFormat}
                  onChange={(e) => updateSetting("general", "dateFormat", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Saat Formatı</Label>
                <select
                  value={settings.general.timeFormat}
                  onChange={(e) => updateSetting("general", "timeFormat", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="24h">24 Saat</option>
                  <option value="12h">12 Saat (AM/PM)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Settings */}
        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Görünüm Ayarları</CardTitle>
              <CardDescription>Kullanıcı arayüzü tercihleri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tema</Label>
                <select
                  value={settings.display.theme}
                  onChange={(e) => {
                    updateSetting("display", "theme", e.target.value);
                    applyTheme(e.target.value);
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="light">Açık</option>
                  <option value="dark">Koyu</option>
                  <option value="auto">Otomatik</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Sayfa Başına Öğe</Label>
                <Input
                  type="number"
                  value={settings.display.itemsPerPage}
                  onChange={(e) => updateSetting("display", "itemsPerPage", parseInt(e.target.value))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Bildirimleri Göster</Label>
                  <p className="text-sm text-muted-foreground">
                    Sistem bildirimlerini göster
                  </p>
                </div>
                <Switch
                  checked={settings.display.showNotifications}
                  onCheckedChange={(checked: boolean) => updateSetting("display", "showNotifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Kompakt Mod</Label>
                  <p className="text-sm text-muted-foreground">
                    Daha az boşluk, daha fazla içerik
                  </p>
                </div>
                <Switch
                  checked={settings.display.compactMode}
                  onCheckedChange={(checked: boolean) => updateSetting("display", "compactMode", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Ayarları</CardTitle>
              <CardDescription>E-posta ve sistem bildirimleri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Toplu İşlem Tamamlandığında Bildir</Label>
                </div>
                <Switch
                  checked={settings.notifications.notifyOnBatchComplete}
                  onCheckedChange={(checked: boolean) => updateSetting("notifications", "notifyOnBatchComplete", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Hata Oluştuğunda Bildir</Label>
                </div>
                <Switch
                  checked={settings.notifications.notifyOnErrors}
                  onCheckedChange={(checked: boolean) => updateSetting("notifications", "notifyOnErrors", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}



