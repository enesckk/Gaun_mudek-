"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileUploadCard } from "@/components/ai/FileUploadCard";
import { ProcessingStatusCard } from "@/components/ai/ProcessingStatusCard";
import { aiApi, type ProcessingStep } from "@/lib/api/aiApi";

export default function AIPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: "extract", label: "Extracting data from document", status: "pending" },
    { id: "detect", label: "Detecting student number", status: "pending" },
    { id: "crop", label: "Analyzing question regions", status: "pending" },
    { id: "gemini", label: "Sending to Gemini Vision API", status: "pending" },
  ]);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setProcessingSteps((steps) =>
      steps.map((s) => ({ ...s, status: "pending" as const }))
    );

    try {
      // Simulate processing steps
      setProcessingSteps((steps) =>
        steps.map((s) => (s.id === "extract" ? { ...s, status: "processing" as const } : s))
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setProcessingSteps((steps) =>
        steps.map((s) =>
          s.id === "extract"
            ? { ...s, status: "completed" as const }
            : s.id === "detect"
            ? { ...s, status: "processing" as const }
            : s
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 800));

      setProcessingSteps((steps) =>
        steps.map((s) =>
          s.id === "detect"
            ? { ...s, status: "completed" as const }
            : s.id === "crop"
            ? { ...s, status: "processing" as const }
            : s
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setProcessingSteps((steps) =>
        steps.map((s) =>
          s.id === "crop"
            ? { ...s, status: "completed" as const }
            : s.id === "gemini"
            ? { ...s, status: "processing" as const }
            : s
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Call actual API
      const response = await aiApi.process(file);

      setProcessingSteps((steps) =>
        steps.map((s) =>
          s.id === "gemini" ? { ...s, status: "completed" as const } : s
        )
      );

      // Store response in localStorage for preview page
      localStorage.setItem(`ai_session_${response.sessionId}`, JSON.stringify(response));

      // Redirect to preview page
      router.push(`/ai/preview?sessionId=${response.sessionId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process document");
      setIsProcessing(false);
      setProcessingSteps((steps) =>
        steps.map((s) => ({ ...s, status: "pending" as const }))
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI Exam Processing</h2>
        <p className="text-muted-foreground">
          Upload exam documents for AI-powered automatic scoring
        </p>
      </div>

      {!isProcessing ? (
        <FileUploadCard onFileSelect={handleFileSelect} />
      ) : (
        <ProcessingStatusCard steps={processingSteps} />
      )}
    </div>
  );
}

