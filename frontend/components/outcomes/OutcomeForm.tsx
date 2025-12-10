"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  learningOutcomeApi,
  type LearningOutcome,
  type CreateLearningOutcomeDto,
  type UpdateLearningOutcomeDto,
} from "@/lib/api/learningOutcomeApi";
import { courseApi } from "@/lib/api/courseApi";

const outcomeSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().min(1, "Description is required"),
});

type OutcomeFormData = z.infer<typeof outcomeSchema>;

interface OutcomeFormProps {
  mode: "create" | "edit";
  outcomeId?: string;
  initialData?: LearningOutcome;
  onSuccess?: () => void;
}

export function OutcomeForm({
  mode,
  outcomeId,
  initialData,
  onSuccess,
}: OutcomeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);

  const form = useForm<OutcomeFormData>({
    resolver: zodResolver(outcomeSchema),
    defaultValues: initialData
      ? {
          courseId: initialData.courseId,
          code: initialData.code,
          description: initialData.description,
        }
      : {
          courseId: "",
          code: "",
          description: "",
        },
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await courseApi.getAll();
      setCourses(data);
    } catch (error) {
      toast.error("Failed to load courses");
    }
  };

  const onSubmit = async (data: OutcomeFormData) => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await learningOutcomeApi.create(data as CreateLearningOutcomeDto);
        toast.success("Learning Outcome created successfully");
        router.push("/outcomes");
      } else if (mode === "edit" && outcomeId) {
        await learningOutcomeApi.update(outcomeId, data as UpdateLearningOutcomeDto);
        toast.success("Learning Outcome updated successfully");
        router.push("/outcomes");
      }
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to save learning outcome";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormItem>
        <FormLabel htmlFor="courseId">Course *</FormLabel>
        <select
          id="courseId"
          {...form.register("courseId")}
          disabled={isSubmitting || mode === "edit"}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select a course</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.code} - {course.name}
            </option>
          ))}
        </select>
        {form.formState.errors.courseId && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.courseId.message}
          </p>
        )}
      </FormItem>

      <FormItem>
        <FormLabel htmlFor="code">Code *</FormLabel>
        <Input
          id="code"
          {...form.register("code")}
          placeholder="e.g., ÖÇ1"
          disabled={isSubmitting}
        />
        {form.formState.errors.code && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.code.message}
          </p>
        )}
      </FormItem>

      <FormItem>
        <FormLabel htmlFor="description">Description *</FormLabel>
        <Textarea
          id="description"
          {...form.register("description")}
          placeholder="Learning outcome description..."
          rows={4}
          disabled={isSubmitting}
        />
        {form.formState.errors.description && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </FormItem>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Kaydediliyor..."
            : mode === "create"
            ? "Öğrenme Çıktısı Oluştur"
            : "Öğrenme Çıktısını Güncelle"}
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
  );
}



