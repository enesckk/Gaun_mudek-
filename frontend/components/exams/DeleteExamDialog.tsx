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
import { examApi } from "@/lib/api/examApi";

interface DeleteExamDialogProps {
  examId: string;
  examTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteExamDialog({
  examId,
  examTitle,
  open,
  onOpenChange,
  onSuccess,
}: DeleteExamDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await examApi.remove(examId);
      toast.success("Sınav başarıyla silindi");
      onOpenChange(false);
      router.refresh();
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Sınav silinemedi. Bu sınava ait puanlar olabilir.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Sınavı Sil</DialogTitle>
          <DialogDescription>
            Bu sınavı silmek tüm sorularını da kaldıracaktır. Bu işlem geri alınamaz.
            <br />
            <br />
            <strong>{examTitle}</strong> kalıcı olarak silinecek.
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

