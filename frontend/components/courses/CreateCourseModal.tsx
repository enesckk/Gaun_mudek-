"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { courseApi } from "@/lib/api/courseApi";

interface LearningOutcome {
  code: string;
  description: string;
}

interface CreateCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateCourseModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateCourseModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [learningOutcomes, setLearningOutcomes] = useState<LearningOutcome[]>([
    { code: "", description: "" },
  ]);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setName("");
    setCode("");
    setDescription("");
    setDepartment("");
    setSemester("");
    setLearningOutcomes([{ code: "", description: "" }]);
    setErrors({});
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onOpenChange(false);
    }
  };

  const addLearningOutcome = () => {
    setLearningOutcomes([...learningOutcomes, { code: "", description: "" }]);
  };

  const removeLearningOutcome = (index: number) => {
    if (learningOutcomes.length > 1) {
      setLearningOutcomes(learningOutcomes.filter((_, i) => i !== index));
    }
  };

  const updateLearningOutcome = (
    index: number,
    field: "code" | "description",
    value: string
  ) => {
    const updated = [...learningOutcomes];
    updated[index][field] = value;
    setLearningOutcomes(updated);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Ders adı gereklidir";
    } else if (name.trim().length < 3) {
      newErrors.name = "Ders adı en az 3 karakter olmalıdır";
    }

    if (!code.trim()) {
      newErrors.code = "Ders kodu gereklidir";
    } else if (code.trim().length < 2) {
      newErrors.code = "Ders kodu en az 2 karakter olmalıdır";
    } else if (!/^[A-Z0-9]+$/.test(code.trim().toUpperCase())) {
      newErrors.code = "Ders kodu sadece büyük harf ve rakam içermelidir";
    }

    // Validate learning outcomes
    const validOutcomes = learningOutcomes.filter(
      (lo) => lo.code.trim() && lo.description.trim()
    );

    if (validOutcomes.length === 0) {
      newErrors.learningOutcomes = "En az bir öğrenme çıktısı (ÖÇ) eklemelisiniz";
    }

    // Validate each learning outcome
    learningOutcomes.forEach((lo, index) => {
      if (lo.code.trim() && !lo.description.trim()) {
        newErrors[`lo_${index}_description`] = "Açıklama gereklidir";
      }
      if (!lo.code.trim() && lo.description.trim()) {
        newErrors[`lo_${index}_code`] = "Kod gereklidir";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Lütfen formdaki hataları düzeltin");
      return;
    }

    setIsLoading(true);

    try {
      // Filter valid learning outcomes
      const validOutcomes = learningOutcomes.filter(
        (lo) => lo.code.trim() && lo.description.trim()
      );

      // Prepare data
      const courseData = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        department: department.trim() || undefined,
        semester: semester.trim() || undefined,
        learningOutcomes: validOutcomes,
      };

      await courseApi.createCourse(courseData);

      toast.success("Ders başarıyla oluşturuldu");
      handleClose();
      onSuccess?.();
      router.refresh();
    } catch (error: any) {
      console.error("Course creation error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Ders kaydedilemedi. Bir hata oluştu.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        onClose={handleClose}
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>Yeni Ders Oluştur</DialogTitle>
          <DialogDescription>
            Yeni bir ders eklemek için aşağıdaki bilgileri doldurun.{" "}
            <span className="text-destructive">*</span> ile işaretli alanlar
            zorunludur.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Temel Bilgiler
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Ders Adı <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Veri Yapıları"
                  disabled={isLoading}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">
                  Ders Kodu <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                  }
                  placeholder="Örn: CS201"
                  disabled={isLoading}
                  className={errors.code ? "border-destructive" : ""}
                />
                {errors.code && (
                  <p className="text-sm text-destructive">{errors.code}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Bölüm</Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Örn: Bilgisayar Mühendisliği"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Dönem</Label>
                <Input
                  id="semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="Örn: Güz 2024"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ders hakkında açıklama..."
                rows={3}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Learning Outcomes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Öğrenme Çıktıları (ÖÇ){" "}
                <span className="text-destructive">*</span>
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLearningOutcome}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                ÖÇ Ekle
              </Button>
            </div>

            {errors.learningOutcomes && (
              <p className="text-sm text-destructive">
                {errors.learningOutcomes}
              </p>
            )}

            <div className="space-y-3">
              {learningOutcomes.map((lo, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-4 border rounded-lg bg-muted/30"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`lo-code-${index}`}>
                        Kod <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`lo-code-${index}`}
                        value={lo.code}
                        onChange={(e) =>
                          updateLearningOutcome(index, "code", e.target.value)
                        }
                        placeholder="Örn: ÖÇ1"
                        disabled={isLoading}
                        className={
                          errors[`lo_${index}_code`] ? "border-destructive" : ""
                        }
                      />
                      {errors[`lo_${index}_code`] && (
                        <p className="text-xs text-destructive">
                          {errors[`lo_${index}_code`]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`lo-desc-${index}`}>
                        Açıklama <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`lo-desc-${index}`}
                        value={lo.description}
                        onChange={(e) =>
                          updateLearningOutcome(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Örn: Algoritma analizini anlama"
                        disabled={isLoading}
                        className={
                          errors[`lo_${index}_description`]
                            ? "border-destructive"
                            : ""
                        }
                      />
                      {errors[`lo_${index}_description`] && (
                        <p className="text-xs text-destructive">
                          {errors[`lo_${index}_description`]}
                        </p>
                      )}
                    </div>
                  </div>

                  {learningOutcomes.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLearningOutcome(index)}
                      disabled={isLoading}
                      className="mt-6"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                "Ders Oluştur"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

