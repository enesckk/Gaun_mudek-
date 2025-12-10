"use client";

import { useState } from "react";
import { Download, FileJson, FileArchive, FileText, Users, BookOpen, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { settingsApi } from "@/lib/api/settingsApi";

export function BackupTools() {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (type: "students" | "courses" | "all" | "mudek") => {
    setIsExporting(type);
    try {
      const blob = await settingsApi.exportData(type);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Set filename based on type
      const extensions: Record<string, string> = {
        students: "json",
        courses: "json",
        all: "zip",
        mudek: "pdf",
      };
      
      a.download = `export_${type}_${new Date().toISOString().split("T")[0]}.${extensions[type]}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to export ${type}`);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Backup & Export Tools
        </CardTitle>
        <CardDescription>
          Export system data for backup or reporting purposes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start gap-2"
            onClick={() => handleExport("students")}
            disabled={isExporting !== null}
          >
            <div className="flex items-center gap-2 w-full">
              <Users className="h-5 w-5" />
              <span className="font-semibold">Export Students</span>
            </div>
            <span className="text-xs text-muted-foreground text-left">
              Download all student data as JSON
            </span>
            {isExporting === "students" && (
              <div className="absolute right-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start gap-2"
            onClick={() => handleExport("courses")}
            disabled={isExporting !== null}
          >
            <div className="flex items-center gap-2 w-full">
              <BookOpen className="h-5 w-5" />
              <span className="font-semibold">Export Courses</span>
            </div>
            <span className="text-xs text-muted-foreground text-left">
              Download all course data as JSON
            </span>
            {isExporting === "courses" && (
              <div className="absolute right-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start gap-2"
            onClick={() => handleExport("all")}
            disabled={isExporting !== null}
          >
            <div className="flex items-center gap-2 w-full">
              <Database className="h-5 w-5" />
              <span className="font-semibold">Export All System Data</span>
            </div>
            <span className="text-xs text-muted-foreground text-left">
              Download complete system backup as ZIP
            </span>
            {isExporting === "all" && (
              <div className="absolute right-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start gap-2"
            onClick={() => handleExport("mudek")}
            disabled={isExporting !== null}
          >
            <div className="flex items-center gap-2 w-full">
              <FileText className="h-5 w-5" />
              <span className="font-semibold">Export MÜDEK Report</span>
            </div>
            <span className="text-xs text-muted-foreground text-left">
              Generate comprehensive accreditation report (PDF)
            </span>
            {isExporting === "mudek" && (
              <div className="absolute right-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

