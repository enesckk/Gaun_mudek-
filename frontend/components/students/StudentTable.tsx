"use client";

import Link from "next/link";
import { Edit, Trash2, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Student } from "@/lib/api/studentApi";
import { type Course } from "@/lib/api/courseApi";
import { DeleteStudentDialog } from "./DeleteStudentDialog";
import { useState } from "react";

interface StudentTableProps {
  students: Student[];
  courses?: Course[];
  onDelete?: () => void;
}

export function StudentTable({ students, courses = [], onDelete }: StudentTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleDeleteClick = (student: Student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setSelectedStudent(null);
    onDelete?.();
  };

  // Get program name for a student from their courses
  const getStudentProgram = (student: Student): string | null => {
    if (!courses || courses.length === 0) return null;
    
    // Find courses where this student is enrolled
    const studentCourses = courses.filter((course: any) => {
      const courseStudents = course.students || [];
      return courseStudents.some((cs: any) => cs.studentNumber === student.studentNumber);
    });
    
    if (studentCourses.length === 0) return null;
    
    // Get program from first course (or find most common program)
    const firstCourse = studentCourses[0];
    const program = (firstCourse as any).program;
    
    if (!program) return null;
    
    // Handle both object and string formats
    if (typeof program === "object" && program !== null) {
      // Program object with populated data
      return program.name || program.nameEn || program.code || null;
    }
    
    // If program is just an ID string, we can't get the name without additional lookup
    // But this shouldn't happen if backend populates correctly
    if (typeof program === "string") {
      return null; // Can't determine name from just ID
    }
    
    return null;
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
        <p className="text-lg font-medium">Öğrenci bulunamadı</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold text-slate-900">Öğrenci Numarası</TableHead>
              <TableHead className="font-semibold text-slate-900">İsim</TableHead>
              <TableHead className="font-semibold text-slate-900">Bölüm</TableHead>
              <TableHead className="font-semibold text-slate-900">Program</TableHead>
              <TableHead className="font-semibold text-slate-900">Sınıf Seviyesi</TableHead>
              <TableHead className="text-right font-semibold text-slate-900">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student, index) => (
              <TableRow
                key={student._id}
                className={index % 2 === 0 ? "bg-background hover:bg-slate-50" : "bg-muted/30 hover:bg-slate-50"}
              >
                <TableCell className="font-medium text-slate-900">
                  <Badge variant="outline" className="font-mono">
                    {student.studentNumber}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-slate-700">{student.name}</TableCell>
                <TableCell>
                  {student.department ? (
                    <Badge variant="secondary" className="text-xs">
                      {student.department}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {getStudentProgram(student) ? (
                    <Badge variant="outline" className="text-xs">
                      {getStudentProgram(student)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {student.classLevel ? (
                    <Badge variant="outline" className="text-xs">
                      {student.classLevel}. Sınıf
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                      className="h-8 w-8"
                    >
                      <Link href={`/students/${student._id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                      className="h-8 w-8"
                    >
                      <Link href={`/students/${student._id}?edit=true`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteClick(student)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedStudent && (
        <DeleteStudentDialog
          studentId={selectedStudent._id}
          studentName={selectedStudent.name}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}

