"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { programOutcomeApi } from "@/lib/api/programOutcomeApi";

interface DeleteProgramOutcomeDialogProps {
  programOutcomeId: string;
  programOutcomeCode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteProgramOutcomeDialog({
  programOutcomeId,
  programOutcomeCode,
  open,
  onOpenChange,
  onSuccess,
}: DeleteProgramOutcomeDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await programOutcomeApi.remove(programOutcomeId);
      toast.success("Program Outcome deleted");
      onOpenChange(false);
      router.refresh();
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to delete program outcome. It may be referenced by learning outcomes.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Delete Program Outcome</DialogTitle>
          <DialogDescription>
            Deleting this Program Outcome will break MÜDEK mappings. Are you absolutely sure?
            <br />
            <br />
            <strong>{programOutcomeCode}</strong> will be permanently deleted. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

