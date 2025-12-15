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
import { studentApi } from "@/lib/api/studentApi";

interface DeleteStudentDialogProps {
  studentId: string;
  studentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteStudentDialog({
  studentId,
  studentName,
  open,
  onOpenChange,
  onSuccess,
}: DeleteStudentDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await studentApi.remove(studentId);
      toast.success("Öğrenci başarıyla silindi");
      onOpenChange(false);
      router.refresh();
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Öğrenci silinemedi. İlişkili puanlar olabilir.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Öğrenciyi Sil</DialogTitle>
          <DialogDescription>
            Bu öğrenciyi silmek, tüm ilişkili akademik verileri kaldıracaktır. Devam etmek istiyor musunuz?
            <br />
            <br />
            <strong>{studentName}</strong> kalıcı olarak silinecektir. Bu işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            İptal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

