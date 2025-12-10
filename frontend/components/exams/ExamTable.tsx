"use client";

import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { type Exam } from "@/lib/api/examApi";
import { type Course } from "@/lib/api/courseApi";
import { DeleteExamDialog } from "./DeleteExamDialog";
import { useState } from "react";

interface ExamTableProps {
  exams: Exam[];
  courses: Record<string, Course>;
  onDelete?: () => void;
}

export function ExamTable({ exams, courses, onDelete }: ExamTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const handleDeleteClick = (exam: Exam) => {
    setSelectedExam(exam);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setSelectedExam(null);
    onDelete?.();
  };

  const formatType = (type: string) => {
    const typeMap: Record<string, string> = {
      midterm: "Vize",
      final: "Final",
    };
    return typeMap[type] || type;
  };

  if (exams.length === 0) {
    return (
      <div className="text-center py-8 text-slate-600 bg-slate-50 rounded-lg border-2 border-dashed">
        <p className="text-lg font-medium">Henüz sınav eklenmemiş</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-base font-semibold">Ders</TableHead>
              <TableHead className="text-base font-semibold">Sınav Kodu</TableHead>
              <TableHead className="text-base font-semibold">Tür</TableHead>
              <TableHead className="text-center text-base font-semibold">Soru Sayısı</TableHead>
              <TableHead className="text-center text-base font-semibold">Max Puan</TableHead>
              <TableHead className="text-right text-base font-semibold">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((exam, index) => {
              const course = courses[exam.courseId];
              const questionCount = exam.questions?.length || exam.questionCount || 0;
              
              return (
                <TableRow
                  key={exam._id}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}
                >
                  <TableCell className="font-medium">
                    {course ? `${course.code} - ${course.name}` : "Bilinmeyen Ders"}
                  </TableCell>
                  <TableCell>{exam.examCode}</TableCell>
                  <TableCell>{formatType(exam.examType)}</TableCell>
                  <TableCell className="text-center">{questionCount}</TableCell>
                  <TableCell className="text-center">{exam.maxScorePerQuestion}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <Link href={`/exams/${exam._id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteClick(exam)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedExam && (
        <DeleteExamDialog
          examId={selectedExam._id}
          examTitle={selectedExam.examCode}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}

