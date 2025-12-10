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
import { type Course } from "@/lib/api/courseApi";
import { DeleteCourseDialog } from "./DeleteCourseDialog";
import { useState } from "react";

interface CourseTableProps {
  courses: Course[];
  onDelete?: () => void;
}

export function CourseTable({ courses, onDelete }: CourseTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleDeleteClick = (course: Course) => {
    setSelectedCourse(course);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setSelectedCourse(null);
    onDelete?.();
  };

  if (courses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No courses found
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Learning Outcomes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course, index) => (
              <TableRow
                key={course._id}
                className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}
              >
                <TableCell className="font-medium">{course.code}</TableCell>
                <TableCell>{course.name}</TableCell>
                <TableCell className="max-w-md truncate">
                  {course.description || "-"}
                </TableCell>
                <TableCell className="text-center">
                  {course.learningOutcomes?.length || 0}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                    >
                      <Link href={`/courses/${course._id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteClick(course)}
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

      {selectedCourse && (
        <DeleteCourseDialog
          courseId={selectedCourse._id}
          courseName={selectedCourse.name}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}

