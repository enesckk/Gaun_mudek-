"use client";

import { useState, useEffect } from "react";
import { Key, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { settingsApi } from "@/lib/api/settingsApi";

export function APIKeyManager() {
  const [apiKey, setApiKey] = useState<string>("");
  const [status, setStatus] = useState<"active" | "invalid" | "not_configured">("not_configured");
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAPIKey();
  }, []);

  const fetchAPIKey = async () => {
    try {
      setIsLoading(true);
      const data = await settingsApi.getAPIKey();
      setApiKey(data.key);
      setStatus(data.status);
    } catch (error) {
      console.error("Failed to fetch API key", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setIsSaving(true);
    try {
      await settingsApi.saveAPIKey(apiKey);
      toast.success("API key saved successfully");
      // Re-fetch to get updated status
      await fetchAPIKey();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save API key");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-500 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </Badge>
        );
      case "invalid":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Invalid
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Not configured
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>AI API Key Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          AI API Key Manager
        </CardTitle>
        <CardDescription>
          Manage your Gemini Vision API key for AI-powered exam processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          {getStatusBadge()}
        </div>

        <div className="space-y-2">
          <label htmlFor="apiKey" className="text-sm font-medium">
            Gemini API Key
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="apiKey"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your API key is stored securely and used only for AI processing
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

