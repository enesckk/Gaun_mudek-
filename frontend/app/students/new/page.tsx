"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentForm } from "@/components/students/StudentForm";

export default function NewStudentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create Student</h2>
        <p className="text-muted-foreground">
          Add a new student to the system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>
            Enter the student details below. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}

