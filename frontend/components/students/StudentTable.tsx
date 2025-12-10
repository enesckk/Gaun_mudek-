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
import { type Student } from "@/lib/api/studentApi";
import { DeleteStudentDialog } from "./DeleteStudentDialog";
import { useState } from "react";

interface StudentTableProps {
  students: Student[];
  onDelete?: () => void;
}

export function StudentTable({ students, onDelete }: StudentTableProps) {
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

  if (students.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No students found
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Class Level</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student, index) => (
              <TableRow
                key={student._id}
                className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}
              >
                <TableCell className="font-medium">{student.studentNumber}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {student.department || "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {student.classLevel || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                    >
                      <Link href={`/students/${student._id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                    >
                      <Link href={`/students/${student._id}?edit=true`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteClick(student)}
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

