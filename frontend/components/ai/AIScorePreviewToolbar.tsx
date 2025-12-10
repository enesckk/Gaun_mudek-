"use client";

import { CheckCircle2, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AIScorePreviewToolbarProps {
  onApproveAndSave: () => void;
  onClearAll: () => void;
  onDiscard: () => void;
  isSaving?: boolean;
  disabled?: boolean;
}

export function AIScorePreviewToolbar({
  onApproveAndSave,
  onClearAll,
  onDiscard,
  isSaving = false,
  disabled = false,
}: AIScorePreviewToolbarProps) {
  return (
    <Card className="rounded-xl shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClearAll}
              disabled={isSaving || disabled}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Clear All
            </Button>
            <Button
              variant="outline"
              onClick={onDiscard}
              disabled={isSaving || disabled}
            >
              <X className="mr-2 h-4 w-4" />
              Discard
            </Button>
          </div>
          <Button
            onClick={onApproveAndSave}
            disabled={isSaving || disabled}
            size="lg"
            className="min-w-[200px]"
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving scores...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve All & Save Scores
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

