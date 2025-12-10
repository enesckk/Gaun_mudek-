"use client";

import { useState } from "react";
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
import { questionApi } from "@/lib/api/questionApi";

interface DeleteQuestionDialogProps {
  questionId: string;
  questionNumber: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteQuestionDialog({
  questionId,
  questionNumber,
  open,
  onOpenChange,
  onSuccess,
}: DeleteQuestionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await questionApi.remove(questionId);
      toast.success("Soru başarıyla silindi");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Soru silinemedi. Bu soruya ait puanlar olabilir.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Soruyu Sil</DialogTitle>
          <DialogDescription>
            Bu soruyu silmek MÜDEK mapping'lerini bozabilir. Emin misiniz?
            <br />
            <br />
            <strong>Soru #{questionNumber}</strong> kalıcı olarak silinecek. Bu işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="h-12 px-6"
          >
            İptal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-12 px-6"
          >
            {isDeleting ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

