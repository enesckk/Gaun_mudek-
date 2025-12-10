"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExamTable } from "@/components/exams/ExamTable";
import { examApi, type Exam } from "@/lib/api/examApi";
import { courseApi, type Course } from "@/lib/api/courseApi";

export default function ExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Record<string, Course>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllExams();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredExams(exams);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = exams.filter((exam) => {
        const course = courses[exam.courseId];
        const courseName = course ? `${course.code} ${course.name}`.toLowerCase() : "";
        const examCode = exam.examCode?.toLowerCase() || "";
        const examType = exam.examType || "";
        return courseName.includes(query) || examCode.includes(query) || examType.includes(query);
      });
      setFilteredExams(filtered);
    }
  }, [searchQuery, exams, courses]);

  const fetchAllExams = async () => {
    try {
      setIsLoading(true);
      const [examsData, coursesData] = await Promise.all([
        examApi.getAll(),
        courseApi.getAll(),
      ]);

      setExams(examsData);
      setFilteredExams(examsData);

      // Create courses lookup map
      const coursesMap: Record<string, Course> = {};
      coursesData.forEach((course) => {
        coursesMap[course._id] = course;
      });
      setCourses(coursesMap);
    } catch (error: any) {
      toast.error("Sınavlar yüklenemedi");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sınavlar</h2>
          <p className="text-muted-foreground">
            Sınavları ve sorularını yönetin
          </p>
        </div>
        <Button onClick={() => router.push("/exams/new")} className="h-12 px-6">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Sınav Oluştur
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sınav Listesi</CardTitle>
          <CardDescription>
            Sistemdeki tüm sınavlar. Düzenlemek için düzenle, silmek için sil butonuna tıklayın.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ders veya sınav adına göre ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Sınavlar yükleniyor...
            </div>
          ) : (
            <ExamTable exams={filteredExams} courses={courses} onDelete={fetchAllExams} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

