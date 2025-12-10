"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Users,
  FileText,
  Target,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LOAchievementTable } from "@/components/reports/LOAchievementTable";
import { POAchievementTable } from "@/components/reports/POAchievementTable";
import { LOProgressCard } from "@/components/reports/LOProgressCard";
import { POProgressCard } from "@/components/reports/POProgressCard";
import { StudentComparisonChart } from "@/components/reports/StudentComparisonChart";
import { HeatmapChart } from "@/components/reports/HeatmapChart";
import { courseApi, type Course } from "@/lib/api/courseApi";
import { examApi, type Exam } from "@/lib/api/examApi";
import { studentApi, type Student } from "@/lib/api/studentApi";
import {
  getLOAchievement,
  getPOAchievement,
  type LOAchievement,
  type POAchievement,
} from "@/lib/api/assessmentApi";

export default function CourseReportPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loAchievements, setLOAchievements] = useState<LOAchievement[]>([]);
  const [poAchievements, setPOAchievements] = useState<POAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchReportData();
    }
  }, [courseId]);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);

      // Fetch basic course data
      const [courseData, examsData] = await Promise.all([
        courseApi.getById(courseId),
        examApi.getByCourse(courseId),
      ]);

      setCourse(courseData);
      setExams(examsData);

      // Get students from course (embedded in course model)
      const courseStudents = courseData.students || [];
      const studentNumbers = courseStudents.map((s) => s.studentNumber);
      const allStudents = await studentApi.getAll();
      const relevantStudents = allStudents.filter((s) =>
        studentNumbers.includes(s.studentNumber)
      );
      setStudents(relevantStudents);

      // Fetch aggregated achievements using new assessment API
      const [loData, poData] = await Promise.all([
        getLOAchievement(courseId),
        getPOAchievement(courseId),
      ]);

      setLOAchievements(loData);
      setPOAchievements(poData);
    } catch (error: any) {
      toast.error("Failed to load report data");
      console.error(error);
      router.push("/reports");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">MÜDEK Report</h2>
          <p className="text-muted-foreground">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">MÜDEK Report</h2>
          <p className="text-muted-foreground">
            Comprehensive accreditation report for {course.code} - {course.name}
          </p>
        </div>
      </div>

      {/* Course Info Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{course.code}</p>
            <p className="text-sm text-muted-foreground">{course.name}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{students.length}</p>
            <p className="text-sm text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{exams.length}</p>
            <p className="text-sm text-muted-foreground">Total exams</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Learning Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{course.learningOutcomes?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total LOs</p>
          </CardContent>
        </Card>
      </div>

      {/* LO Achievement Table */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Learning Outcome Achievement
          </CardTitle>
          <CardDescription>
            Average achievement percentages for each Learning Outcome across all students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LOAchievementTable achievements={loAchievements} />
        </CardContent>
      </Card>

      {/* LO Progress Cards */}
      {loAchievements.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle>LO Achievement Overview</CardTitle>
            <CardDescription>Visual representation of Learning Outcome achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {loAchievements.map((achievement) => (
                <LOProgressCard key={achievement.code} achievement={achievement} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PO Achievement Table */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Program Outcome Contribution
          </CardTitle>
          <CardDescription>
            Average achievement percentages for each Program Outcome
          </CardDescription>
        </CardHeader>
        <CardContent>
          <POAchievementTable achievements={poAchievements} />
        </CardContent>
      </Card>

      {/* PO Progress Cards */}
      {poAchievements.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle>PO Achievement Overview</CardTitle>
            <CardDescription>Visual representation of Program Outcome achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {poAchievements.map((achievement) => (
                <POProgressCard key={achievement.code} achievement={achievement} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Comparison Chart */}
      {students.length > 0 && loAchievements.length > 0 && (
        <StudentComparisonChart
          students={students}
          studentAchievements={{}}
        />
      )}

      {/* Heatmap Chart */}
      {students.length > 0 && course.learningOutcomes && course.learningOutcomes.length > 0 && (
        <HeatmapChart
          students={students}
          learningOutcomes={course.learningOutcomes.map((lo) => ({
            _id: lo.code,
            code: lo.code,
          }))}
          studentAchievements={{}}
        />
      )}
    </div>
  );
}

