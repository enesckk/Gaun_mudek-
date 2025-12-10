"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseForm } from "@/components/courses/CourseForm";
import { BookOpen } from "lucide-react";

export default function NewCoursePage() {
  useEffect(() => {
    // Sayfa yüklendiğinde en üste scroll et
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Yeni Ders Oluştur</h2>
            <p className="text-muted-foreground">
              Sisteme yeni bir ders ekleyin
            </p>
          </div>
        </div>

        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle>Ders Bilgileri</CardTitle>
            <CardDescription>
              Aşağıdaki alanları doldurun. <span className="text-destructive">*</span> ile işaretli alanlar zorunludur.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <CourseForm mode="create" />
          </CardContent>
        </Card>
    </div>
  );
}

