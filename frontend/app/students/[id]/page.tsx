"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { User, Hash, Building2, GraduationCap, Edit, BookOpen, ExternalLink, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentForm } from "@/components/students/StudentForm";
import { StudentLOAchievementCard } from "@/components/students/StudentLOAchievementCard";
import { StudentPOAchievementCard } from "@/components/students/StudentPOAchievementCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { studentApi, type Student } from "@/lib/api/studentApi";
import { scoreApi, type LOAchievement, type POAchievement } from "@/lib/api/scoreApi";
import { courseApi, type Course } from "@/lib/api/courseApi";

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = params.id as string;
  const isEditMode = searchParams.get("edit") === "true";

  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [loAchievements, setLOAchievements] = useState<LOAchievement[]>([]);
  const [poAchievements, setPOAchievements] = useState<POAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [examResults, setExamResults] = useState<Student["examResults"]>([]);

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
      const [studentData, coursesData] = await Promise.all([
        studentApi.getById(studentId),
        courseApi.getAll(),
      ]);

      setStudent(studentData);
      setCourses(coursesData);
      const results = studentData.examResults || [];
      console.log(`📊 Frontend: ${results.length} sınav sonucu alındı`, results);
      setExamResults(results);

      // Set first course as default if available
      if (coursesData.length > 0 && !selectedCourseId) {
        setSelectedCourseId(coursesData[0]._id);
      }
    } catch (error: any) {
      toast.error("Öğrenci verileri yüklenirken hata oluştu");
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

  // Find courses where this student is enrolled (must be before conditional returns)
  const enrolledCourses = useMemo(() => {
    if (!student) return [];
    return courses.filter((course) => {
      const courseStudents = course.students || [];
      return courseStudents.some(
        (s) => s.studentNumber === student.studentNumber
      );
    });
  }, [courses, student]);

  const selectedCourse = courses.find((c) => c._id === selectedCourseId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">Öğrenci verileri yükleniyor...</p>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  if (isEditMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/students/${studentId}`)} className="px-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Geri
          </Button>
          <p className="text-muted-foreground">
            Öğrenci bilgilerini güncelleyin
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Öğrenci Bilgileri</CardTitle>
            <CardDescription>
              Aşağıdaki öğrenci ayrıntılarını güncelleyin. * işaretli alanlar zorunludur.
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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/students")} className="px-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Geri
          </Button>
          <p className="text-muted-foreground">
            Öğrenci bilgilerini ve akademik performansını görüntüleyin
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/students/${studentId}?edit=true`)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Öğrenciyi Düzenle
        </Button>
      </div>

      {/* Student Info Card */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Öğrenci Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">İsim</p>
                <p className="font-semibold">{student.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Öğrenci Numarası</p>
                <p className="font-semibold">{student.studentNumber}</p>
              </div>
            </div>
            {student.department && (
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Bölüm</p>
                  <p className="font-semibold">{student.department}</p>
                </div>
              </div>
            )}
            {student.classLevel && (
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Sınıf Seviyesi</p>
                  <p className="font-semibold">{student.classLevel}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Courses Card */}
      <Card className="rounded-xl shadow-sm border-2 border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Kayıtlı Olduğu Dersler
          </CardTitle>
          <CardDescription className="text-sm">
            Bu öğrencinin kayıtlı olduğu dersler. Ders oluştururken öğrenci listesine eklendiğinde burada görünecektir.
            {enrolledCourses.length > 0 && (
              <span className="ml-2 font-medium text-slate-700">
                ({enrolledCourses.length} ders)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p className="text-lg font-medium">Bu öğrenci henüz hiçbir derse kayıtlı değil</p>
              <p className="text-sm mt-2">
                Ders oluştururken öğrenci listesine eklendiğinde burada görünecektir
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map((course) => {
                const department = typeof course.department === 'object' && course.department !== null
                  ? course.department.name
                  : course.department || "Bilinmiyor";
                
                return (
                  <Card
                    key={course._id}
                    className="border-2 border-slate-200 hover:border-[#0a294e] transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/courses/${course._id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {course.code}
                            </Badge>
                            {course.semester && (
                              <Badge variant="secondary" className="text-xs">
                                {course.semester}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                            {course.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-2">
                            {department}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-slate-200">
                        <span>
                          <span className="font-semibold text-slate-700">
                            {course.learningOutcomes?.length || 0}
                          </span>{" "}
                          ÖÇ
                        </span>
                        <span>
                          <span className="font-semibold text-slate-700">
                            {course.students?.length || 0}
                          </span>{" "}
                          Öğrenci
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exam Results from AI Scoring */}
      <Card className="rounded-xl shadow-sm border-2 border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <CardTitle className="text-xl text-slate-900">Sınav Sonuçları</CardTitle>
          <CardDescription className="text-sm">
            AI puanlama ile okunan sınav sonuçları
            {examResults && examResults.length > 0 && (
              <span className="ml-2 font-medium text-slate-700">
                ({examResults.length} sınav)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {!examResults || examResults.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <p className="text-lg font-medium">Henüz açıklanmış sınav yok</p>
              <p className="text-sm mt-2">Sınav sonuçları AI puanlama veya toplu yükleme ile eklendikten sonra burada görünecektir</p>
            </div>
          ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Sınav Kodu</TableHead>
                      <TableHead className="w-[100px]">Tür</TableHead>
                      <TableHead className="w-[200px]">Ders</TableHead>
                      {(() => {
                        // En fazla soru sayısını bul
                        const maxQuestions = Math.max(
                          ...examResults.map(r => {
                            const sorted = [...(r.questionScores || [])].sort(
                              (a, b) => a.questionNumber - b.questionNumber
                            );
                            return sorted.length > 0 
                              ? Math.max(...sorted.map(qs => qs.questionNumber))
                              : 0;
                          })
                        );
                        return Array.from({ length: maxQuestions }, (_, i) => (
                          <TableHead key={i + 1} className="text-center w-[80px]">
                            Soru {i + 1}
                          </TableHead>
                        ));
                      })()}
                      <TableHead className="text-center w-[100px]">Toplam</TableHead>
                      <TableHead className="text-center w-[100px]">Max</TableHead>
                      <TableHead className="text-center w-[100px]">Yüzde</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examResults.map((result, index) => {
                      // Soru numaralarına göre sırala
                      const sortedScores = [...(result.questionScores || [])].sort(
                        (a, b) => a.questionNumber - b.questionNumber
                      );
                      const maxQuestionNumber = sortedScores.length > 0 
                        ? Math.max(...sortedScores.map(qs => qs.questionNumber))
                        : 0;
                      
                      // Tüm sınavlar için en fazla soru sayısını bul
                      const globalMaxQuestions = Math.max(
                        ...examResults.map(r => {
                          const sorted = [...(r.questionScores || [])].sort(
                            (a, b) => a.questionNumber - b.questionNumber
                          );
                          return sorted.length > 0 
                            ? Math.max(...sorted.map(qs => qs.questionNumber))
                            : 0;
                        })
                      );

                      // Unique key oluştur
                      const uniqueKey = result._id || `${result.examId || 'exam'}-${result.createdAt || index}`;
                      console.log(`🔑 Rendering result ${index + 1}: key=${uniqueKey}, examCode=${result.examCode}, examId=${result.examId}`);

                      return (
                        <TableRow key={uniqueKey}>
                          <TableCell className="font-medium">
                            {result.examCode || "Bilinmeyen"}
                          </TableCell>
                          <TableCell>
                            {result.examType && (
                              <Badge variant={result.examType === "midterm" ? "default" : "secondary"}>
                                {result.examType === "midterm" ? "Vize" : "Final"}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {result.courseName || "-"}
                          </TableCell>
                          {Array.from({ length: globalMaxQuestions }, (_, i) => {
                            const qs = sortedScores.find(s => s.questionNumber === i + 1);
                            return (
                              <TableCell key={i + 1} className="text-center">
                                {qs?.score ?? "-"}
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-center font-semibold">
                            {result.totalScore ?? 0}
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {result.maxTotalScore ?? 0}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                (result.percentage ?? 0) >= 70
                                  ? "default"
                                  : (result.percentage ?? 0) >= 50
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {result.percentage ?? 0}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

      {/* Course Selection for Achievements */}
      {courses.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle>Ders Seçimi</CardTitle>
            <CardDescription>
              Öğrenme Çıktısı ve Program Çıktısı başarılarını görüntülemek için bir ders seçin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Bir ders seçin</option>
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

