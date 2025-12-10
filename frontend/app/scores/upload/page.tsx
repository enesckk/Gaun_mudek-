"use client";

import { AIScoreUploadForm } from "@/components/scores/AIScoreUploadForm";

export default function ScoreUploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI Bulk Score Upload</h2>
        <p className="text-muted-foreground">
          Upload AI-scanned exam scores in JSON or CSV format
        </p>
      </div>

      <AIScoreUploadForm />
    </div>
  );
}

