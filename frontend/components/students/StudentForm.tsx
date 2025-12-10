"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  studentApi,
  type Student,
  type CreateStudentDto,
  type UpdateStudentDto,
} from "@/lib/api/studentApi";

const studentSchema = z.object({
  studentNumber: z.string().min(1, "Student number is required"),
  name: z.string().min(1, "Name is required"),
  department: z.string().optional(),
  classLevel: z.number().int().positive().optional().or(z.literal("")),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  mode: "create" | "edit";
  studentId?: string;
  initialData?: Student;
  onSuccess?: () => void;
}

export function StudentForm({
  mode,
  studentId,
  initialData,
  onSuccess,
}: StudentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData
      ? {
          studentNumber: initialData.studentNumber,
          name: initialData.name,
          department: initialData.department || "",
          classLevel: initialData.classLevel || "",
        }
      : {
          studentNumber: "",
          name: "",
          department: "",
          classLevel: "",
        },
  });

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    try {
      const submitData: CreateStudentDto | UpdateStudentDto = {
        name: data.name,
        department: data.department || undefined,
        classLevel: data.classLevel && data.classLevel !== "" ? Number(data.classLevel) : undefined,
      };

      if (mode === "create") {
        await studentApi.create({
          ...submitData,
          studentNumber: data.studentNumber,
        } as CreateStudentDto);
        toast.success("Student saved");
        router.push("/students");
      } else if (mode === "edit" && studentId) {
        await studentApi.update(studentId, submitData as UpdateStudentDto);
        toast.success("Student saved");
        router.push("/students");
      }
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to save student";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormItem>
        <FormLabel htmlFor="studentNumber">Student Number *</FormLabel>
        <Input
          id="studentNumber"
          {...form.register("studentNumber")}
          placeholder="e.g., 2021001234"
          disabled={isSubmitting || mode === "edit"}
        />
        {form.formState.errors.studentNumber && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.studentNumber.message}
          </p>
        )}
      </FormItem>

      <FormItem>
        <FormLabel htmlFor="name">Name *</FormLabel>
        <Input
          id="name"
          {...form.register("name")}
          placeholder="e.g., John Doe"
          disabled={isSubmitting}
        />
        {form.formState.errors.name && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </FormItem>

      <FormItem>
        <FormLabel htmlFor="department">Department</FormLabel>
        <Input
          id="department"
          {...form.register("department")}
          placeholder="e.g., Computer Engineering"
          disabled={isSubmitting}
        />
        {form.formState.errors.department && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.department.message}
          </p>
        )}
      </FormItem>

      <FormItem>
        <FormLabel htmlFor="classLevel">Class Level</FormLabel>
        <Input
          id="classLevel"
          type="number"
          {...form.register("classLevel", { valueAsNumber: true })}
          placeholder="e.g., 3"
          disabled={isSubmitting}
        />
        {form.formState.errors.classLevel && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.classLevel.message}
          </p>
        )}
      </FormItem>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : mode === "create"
            ? "Create Student"
            : "Update Student"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

