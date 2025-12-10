"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { User, Hash, Building2, GraduationCap, Edit } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudentForm } from "@/components/students/StudentForm";
import { StudentExamScoreTable } from "@/components/students/StudentExamScoreTable";
import { StudentLOAchievementCard } from "@/components/students/StudentLOAchievementCard";
import { StudentPOAchievementCard } from "@/components/students/StudentPOAchievementCard";
import { studentApi, type Student } from "@/lib/api/studentApi";
import { scoreApi, type Score, type LOAchievement, type POAchievement } from "@/lib/api/scoreApi";
import { courseApi, type Course } from "@/lib/api/courseApi";

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = params.id as string;
  const isEditMode = searchParams.get("edit") === "true";

  const [student, setStudent] = useState<Student | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [loAchievements, setLOAchievements] = useState<LOAchievement[]>([]);
  const [poAchievements, setPOAchievements] = useState<POAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId && selectedCourseId) {
      fetchAchievements();
    }
  }, [studentId, selectedCourseId]);

  const fetchStudentData = async () => {
    try {
      setIsLoading(true);
      const [studentData, scoresData, coursesData] = await Promise.all([
        studentApi.getById(studentId),
        scoreApi.getByStudent(studentId),
        courseApi.getAll(),
      ]);

      setStudent(studentData);
      setScores(scoresData);
      setCourses(coursesData);

      // Set first course as default if available
      if (coursesData.length > 0 && !selectedCourseId) {
        setSelectedCourseId(coursesData[0]._id);
      }
    } catch (error: any) {
      toast.error("Failed to load student data");
      router.push("/students");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAchievements = async () => {
    if (!selectedCourseId) return;

    try {
      const [loData, poData] = await Promise.all([
        scoreApi.calculateLOAchievement(studentId, selectedCourseId),
        scoreApi.calculatePOAchievement(studentId, selectedCourseId),
      ]);

      setLOAchievements(loData);
      setPOAchievements(poData);
    } catch (error: any) {
      console.error("Failed to load achievements", error);
      // Don't show error toast, just log it
    }
  };

  const handleEditSuccess = () => {
    fetchStudentData();
    router.push(`/students/${studentId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Details</h2>
          <p className="text-muted-foreground">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  const selectedCourse = courses.find((c) => c._id === selectedCourseId);

  if (isEditMode) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Student</h2>
          <p className="text-muted-foreground">
            Update student information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>
              Update the student details below. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentForm
              mode="edit"
              studentId={studentId}
              initialData={student}
              onSuccess={handleEditSuccess}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Details</h2>
          <p className="text-muted-foreground">
            View student information and academic performance
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/students/${studentId}?edit=true`)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Student
        </Button>
      </div>

      {/* Student Info Card */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{student.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Student Number</p>
                <p className="font-semibold">{student.studentNumber}</p>
              </div>
            </div>
            {student.department && (
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-semibold">{student.department}</p>
                </div>
              </div>
            )}
            {student.classLevel && (
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Class Level</p>
                  <p className="font-semibold">{student.classLevel}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exam Score Table */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Exam Scores</CardTitle>
          <CardDescription>
            All exam scores for this student, grouped by exam
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentExamScoreTable scores={scores} />
        </CardContent>
      </Card>

      {/* Course Selection for Achievements */}
      {courses.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle>Course Selection</CardTitle>
            <CardDescription>
              Select a course to view Learning Outcome and Program Outcome achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      {/* LO Achievement */}
      {selectedCourseId && loAchievements.length > 0 && (
        <StudentLOAchievementCard
          achievements={loAchievements}
          courseName={selectedCourse?.name}
        />
      )}

      {/* PO Achievement */}
      {selectedCourseId && poAchievements.length > 0 && (
        <StudentPOAchievementCard
          achievements={poAchievements}
          courseName={selectedCourse?.name}
        />
      )}
    </div>
  );
}

