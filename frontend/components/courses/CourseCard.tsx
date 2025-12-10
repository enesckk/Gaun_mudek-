"use client";

import Link from "next/link";
import { Edit, Trash2, Calendar, Users, Target, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Course } from "@/lib/api/courseApi";

interface CourseCardProps {
  course: Course;
  onDelete: (course: Course) => void;
}

export function CourseCard({ course, onDelete }: CourseCardProps) {
  const semester = course.semester || "-";
  const departmentName = (course as any).department?.name || (typeof (course as any).department === "string" ? (course as any).department : "(Eski kayıt – bölüm seçilmemiş)");
  const learningOutcomeCount = course.learningOutcomes?.length || 0;
  const studentCount = course.students?.length || 0;
  const midtermCode = course.midtermExam?.examCode || "-";
  const finalCode = course.finalExam?.examCode || "-";
  const updatedAt = course.updatedAt
    ? new Date(course.updatedAt).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  return (
    <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Course Name - Large and Bold */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{course.name}</h3>
            <p className="text-lg text-muted-foreground">Kod: {course.code}</p>
          </div>

          {/* Course Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Dönem</p>
                <p className="text-base font-semibold">{semester}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-5 w-5 text-muted-foreground flex items-center justify-center">
                <span className="text-xs">🏛️</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bölüm</p>
                <p className="text-base font-semibold">{departmentName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">ÖÇ Sayısı</p>
                <p className="text-base font-semibold">{learningOutcomeCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Öğrenci Sayısı</p>
                <p className="text-base font-semibold">{studentCount}</p>
              </div>
            </div>
          </div>

          {/* Exam Codes */}
          <div className="flex items-center gap-4 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Vize:</span>
              <Badge variant="outline" className="text-base px-3 py-1">
                {midtermCode}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Final:</span>
              <Badge variant="outline" className="text-base px-3 py-1">
                {finalCode}
              </Badge>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-sm text-muted-foreground">
            Son güncelleme: {updatedAt}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 border-t border-border">
            <Button
              asChild
              variant="default"
              size="lg"
              className="flex-1 h-12 text-base font-semibold"
            >
              <Link href={`/dashboard/courses/${course._id}`}>
                <FileText className="h-5 w-5 mr-2" />
                Detay
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="flex-1 h-12 text-base font-semibold"
            >
              <Link href={`/dashboard/courses/edit/${course._id}`}>
                <Edit className="h-5 w-5 mr-2" />
                Düzenle
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onClick={() => onDelete(course)}
              className="h-12 text-base font-semibold px-4"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

