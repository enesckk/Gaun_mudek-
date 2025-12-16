"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Edit, FileText, Target, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { courseApi, type Course } from "@/lib/api/courseApi";
import { programOutcomeApi, type ProgramOutcome } from "@/lib/api/programOutcomeApi";
import { examApi, type Exam } from "@/lib/api/examApi";
import { studentApi, type Student } from "@/lib/api/studentApi";
import { LearningOutcomeMapping } from "@/components/courses/LearningOutcomeMapping";
import { MudekMatrixView } from "@/components/courses/MudekMatrixView";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setIsLoading(true);
      const [courseData, examsData] = await Promise.all([
        courseApi.getById(courseId),
        examApi.getByCourse(courseId).catch(() => []) // If fails, return empty array
      ]);
      setCourse(courseData);
      setExams(examsData);

      // Load students if course has students
      if (courseData.students && courseData.students.length > 0) {
        try {
          const allStudents = await studentApi.getAll();
          const courseStudentNumbers = courseData.students.map(s => s.studentNumber);
          const relevantStudents = allStudents.filter(s => 
            courseStudentNumbers.includes(s.studentNumber)
          );
          setStudents(relevantStudents);
        } catch (error) {
          console.error("Failed to load students:", error);
          // Don't show error, just log it
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Ders bilgileri yüklenemedi");
      router.push("/dashboard/courses");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0a294e]" />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const department = (course as any).department;
  const departmentId = typeof department === "object" ? department?._id : null;
  const departmentName = typeof department === "object" ? department?.name : department || "Bilinmiyor";
  
  // Get programId from course
  const program = (course as any).program;
  const programId = typeof program === "object" && program !== null ? program?._id : (typeof program === "string" ? program : null);

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/courses")}
              className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground truncate">{course.name}</h1>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg mt-1 break-words">
                <span className="whitespace-nowrap">Kod: {course.code}</span>
                <span className="hidden sm:inline"> | </span>
                <span className="block sm:inline sm:ml-0">Bölüm: {departmentName}</span>
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push(`/dashboard/courses/edit/${courseId}`)}
            className="h-10 sm:h-12 px-4 sm:px-6 bg-[#0a294e] hover:bg-[#0a294e]/90 text-white text-sm sm:text-base w-full sm:w-auto"
          >
            <Edit className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Düzenle
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto sm:h-14 p-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm md:text-base font-semibold py-2 sm:py-0">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Genel Bakış</span>
              <span className="sm:hidden">Genel</span>
            </TabsTrigger>
            <TabsTrigger value="mapping" className="text-xs sm:text-sm md:text-base font-semibold py-2 sm:py-0">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">ÖÇ → PÇ Eşlemesi</span>
              <span className="sm:hidden">Eşleme</span>
            </TabsTrigger>
            <TabsTrigger value="matrix" className="text-xs sm:text-sm md:text-base font-semibold py-2 sm:py-0">
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">MEDEK Matrisi</span>
              <span className="sm:hidden">Matris</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 border-[#0a294e]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#0a294e]">Ders Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Ders Adı</p>
                    <p className="text-lg font-semibold">{course.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ders Kodu</p>
                    <p className="text-lg font-semibold">{course.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bölüm</p>
                    <p className="text-lg font-semibold">{departmentName}</p>
                  </div>
                  {(course as any).semester && (
                    <div>
                      <p className="text-sm text-muted-foreground">Dönem</p>
                      <p className="text-lg font-semibold">{(course as any).semester}</p>
                    </div>
                  )}
                  {course.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Açıklama</p>
                      <p className="text-lg">{course.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-2 border-[#0a294e]/20">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl text-[#0a294e]">İstatistikler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Öğrenme Çıktısı Sayısı</p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0a294e]">
                      {course.learningOutcomes?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Öğrenci Sayısı</p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0a294e]">
                      {course.students?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Toplam Sınav Sayısı</p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0a294e]">
                      {exams.length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exams List */}
            {exams.length > 0 && (
              <Card className="border-2 border-[#0a294e]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#0a294e]">Sınavlar</CardTitle>
                  <CardDescription>
                    Bu derse ait tüm sınavların listesi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {exams.filter(e => e.examType === "midterm").length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Vize Sınavları</p>
                        <div className="flex flex-wrap gap-2">
                          {exams
                            .filter(e => e.examType === "midterm")
                            .map((exam) => (
                              <Badge 
                                key={exam._id} 
                                variant="outline" 
                                className="text-base px-3 py-1.5"
                              >
                                {exam.examCode}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                    {exams.filter(e => e.examType === "final").length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Final Sınavları</p>
                        <div className="flex flex-wrap gap-2">
                          {exams
                            .filter(e => e.examType === "final")
                            .map((exam) => (
                              <Badge 
                                key={exam._id} 
                                variant="outline" 
                                className="text-base px-3 py-1.5"
                              >
                                {exam.examCode}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Students List */}
            {course.students && course.students.length > 0 && (
              <Card className="border-2 border-[#0a294e]/20">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl text-[#0a294e] flex items-center gap-2">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                    Öğrenci Listesi
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Bu derse kayıtlı {course.students.length} öğrenci
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-2 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                    {course.students.map((courseStudent, index) => {
                      const student = students.find(s => s.studentNumber === courseStudent.studentNumber);
                      const studentId = student?._id;
                      const studentName = student?.name || courseStudent.fullName || courseStudent.studentNumber;
                      
                      return (
                        <div
                          key={index}
                          className="p-2 sm:p-3 border border-gray-200 rounded-lg hover:border-[#0a294e]/30 hover:bg-gray-50 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                          onClick={() => {
                            if (studentId) {
                              router.push(`/students/${studentId}`);
                            } else {
                              router.push(`/students?search=${courseStudent.studentNumber}`);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0a294e]/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs sm:text-sm font-semibold text-[#0a294e]">
                                {index + 1}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm sm:text-base truncate">{studentName}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">{courseStudent.studentNumber}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (studentId) {
                                router.push(`/students/${studentId}`);
                              } else {
                                router.push(`/students?search=${courseStudent.studentNumber}`);
                              }
                            }}
                            className="text-[#0a294e] hover:text-[#0a294e]/80 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 flex-shrink-0"
                          >
                            Detay
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Learning Outcomes List */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <Card className="border-2 border-[#0a294e]/20">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl text-[#0a294e]">Öğrenme Çıktıları (ÖÇ)</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {course.learningOutcomes.map((lo, index) => (
                      <div
                        key={index}
                        className="p-3 sm:p-4 border-2 border-gray-200 rounded-xl hover:border-[#0a294e]/30 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                          <Badge variant="default" className="bg-[#0a294e] text-white text-sm sm:text-base px-2 sm:px-3 py-1 w-fit">
                            {lo.code}
                          </Badge>
                          <p className="text-sm sm:text-base md:text-lg flex-1 break-words">{lo.description}</p>
                        </div>
                        {(lo as any).programOutcomes && (lo as any).programOutcomes.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs sm:text-sm text-muted-foreground mb-2">İlişkili Program Çıktıları:</p>
                            <div className="flex flex-wrap gap-2">
                              {(lo as any).programOutcomes.map((poCode: string) => (
                                <Badge key={poCode} variant="outline" className="text-xs sm:text-sm">
                                  {poCode}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ÖÇ → PÇ Mapping Tab */}
          <TabsContent value="mapping">
            {departmentId ? (
              <LearningOutcomeMapping
                courseId={courseId}
                course={course}
                departmentId={departmentId}
                onUpdate={loadCourse}
              />
            ) : (
              <Card className="border-2 border-yellow-200">
                <CardContent className="p-8 text-center">
                  <p className="text-lg text-muted-foreground">
                    Bu ders için bölüm bilgisi bulunamadı. ÖÇ → PÇ eşlemesi yapabilmek için lütfen dersi düzenleyip bölüm seçin.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* MEDEK Matrix Tab */}
          <TabsContent value="matrix">
            {departmentId ? (
              <MudekMatrixView
                courseId={courseId}
                course={course}
                departmentId={departmentId}
                onUpdate={loadCourse}
              />
            ) : (
              <Card className="border-2 border-yellow-200">
                <CardContent className="p-8 text-center">
                  <p className="text-lg text-muted-foreground">
                    Bu ders için bölüm bilgisi bulunamadı. MEDEK matrisi görüntülemek için lütfen dersi düzenleyip bölüm seçin.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


