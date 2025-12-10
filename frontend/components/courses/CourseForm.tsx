"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { courseApi, type Course, type CreateCourseDto, type UpdateCourseDto } from "@/lib/api/courseApi";

const courseSchema = z.object({
  name: z
    .string()
    .min(1, "Ders adı gereklidir")
    .min(3, "Ders adı en az 3 karakter olmalıdır")
    .trim(),
  code: z
    .string()
    .min(1, "Ders kodu gereklidir")
    .min(2, "Ders kodu en az 2 karakter olmalıdır")
    .regex(/^[A-Z0-9]+$/, "Ders kodu sadece büyük harf ve rakam içermelidir")
    .trim(),
  description: z.string().optional().or(z.literal("")),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  mode: "create" | "edit";
  courseId?: string;
  initialData?: Course;
  onSuccess?: () => void;
}

export function CourseForm({
  mode,
  courseId,
  initialData,
  onSuccess,
}: CourseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: initialData || {
      name: "",
      code: "",
      description: "",
    },
    mode: "onChange", // Real-time validation
  });

  const onSubmit = async (data: CourseFormData) => {
    console.log("Form submitted with data:", data);
    setIsSubmitting(true);
    try {
      // Clean up description - convert empty string to undefined
      const submitData = {
        ...data,
        description: data.description?.trim() || undefined,
      };
      
      if (mode === "create") {
        console.log("Creating course with data:", submitData);
        const result = await courseApi.createCourse(submitData as CreateCourseDto);
        console.log("Course created successfully:", result);
        if (result.data.success) {
          toast.success("Ders başarıyla oluşturuldu");
          router.push("/dashboard/courses");
        } else {
          throw new Error(result.data.error || "Ders oluşturulamadı");
        }
      } else if (mode === "edit" && courseId) {
        console.log("Updating course with data:", submitData);
        const result = await courseApi.updateCourse(courseId, submitData as UpdateCourseDto);
        console.log("Course updated successfully:", result);
        if (result.data.success) {
          toast.success("Ders başarıyla güncellendi");
          router.push("/dashboard/courses");
        } else {
          throw new Error(result.data.error || "Ders güncellenemedi");
        }
      }
      onSuccess?.();
    } catch (error: any) {
      console.error("Course save error details:", {
        error,
        response: error.response,
        message: error.message,
        data: error.response?.data,
      });
      const errorMessage =
        error.response?.data?.message || 
        error.message ||
        "Ders kaydedilemedi. Lütfen tekrar deneyin.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submit event triggered");
    console.log("Form errors:", form.formState.errors);
    console.log("Form values:", form.getValues());
    console.log("Form is valid:", form.formState.isValid);
    
    // Trigger validation
    const isValid = await form.trigger();
    console.log("Validation result:", isValid);
    
    if (isValid) {
      form.handleSubmit(onSubmit)(e);
    } else {
      console.log("Form validation failed, errors:", form.formState.errors);
      toast.error("Lütfen formdaki hataları düzeltin");
    }
  };

  return (
    <div className="w-full">
      <Form>
        <form onSubmit={handleFormSubmit} className="space-y-6">
        <FormItem>
          <FormLabel htmlFor="code">
            Ders Kodu <span className="text-destructive">*</span>
          </FormLabel>
          <Controller
            name="code"
            control={form.control}
            render={({ field }) => (
              <Input
                {...field}
                id="code"
                placeholder="Örn: DB101, CS201"
                disabled={isSubmitting}
                className={form.formState.errors.code ? "border-destructive" : ""}
                onChange={(e) => {
                  field.onChange(e.target.value.toUpperCase()); // Auto uppercase
                }}
              />
            )}
          />
          {form.formState.errors.code && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.code.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Ders kodu sadece büyük harf ve rakam içermelidir
          </p>
        </FormItem>

        <FormItem>
          <FormLabel htmlFor="name">
            Ders Adı <span className="text-destructive">*</span>
          </FormLabel>
          <Controller
            name="name"
            control={form.control}
            render={({ field }) => (
              <Input
                {...field}
                id="name"
                placeholder="Örn: Veritabanı Yönetim Sistemleri"
                disabled={isSubmitting}
                className={form.formState.errors.name ? "border-destructive" : ""}
              />
            )}
          />
          {form.formState.errors.name && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </FormItem>

        <FormItem>
          <FormLabel htmlFor="description">Açıklama</FormLabel>
          <Controller
            name="description"
            control={form.control}
            render={({ field }) => (
              <Textarea
                {...field}
                id="description"
                placeholder="Ders hakkında açıklama (isteğe bağlı)..."
                rows={4}
                disabled={isSubmitting}
                className={form.formState.errors.description ? "border-destructive" : ""}
              />
            )}
          />
          {form.formState.errors.description && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.description.message}
            </p>
          )}
        </FormItem>

        <div className="flex gap-4 pt-4">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : mode === "create" ? (
              "Ders Oluştur"
            ) : (
              "Güncelle"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            İptal
          </Button>
        </div>
        </form>
      </Form>
    </div>
  );
}

