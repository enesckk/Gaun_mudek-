"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Edit, FileText, Target, GraduationCap, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { courseApi, type Course } from "@/lib/api/courseApi";
import { programOutcomeApi, type ProgramOutcome } from "@/lib/api/programOutcomeApi";
import { LearningOutcomeMapping } from "@/components/courses/LearningOutcomeMapping";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
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
      const data = await courseApi.getById(courseId);
      setCourse(data);
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/courses")}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">{course.name}</h1>
              <p className="text-muted-foreground text-lg mt-1">
                Kod: {course.code} | Bölüm: {departmentName}
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push(`/dashboard/courses/edit/${courseId}`)}
            className="h-12 px-6 bg-[#0a294e] hover:bg-[#0a294e]/90 text-white"
          >
            <Edit className="h-5 w-5 mr-2" />
            Düzenle
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-14">
            <TabsTrigger value="overview" className="text-base font-semibold">
              <FileText className="h-5 w-5 mr-2" />
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger value="mapping" className="text-base font-semibold">
              <Target className="h-5 w-5 mr-2" />
              ÖÇ → PÇ Eşlemesi
            </TabsTrigger>
            <TabsTrigger value="matrix" className="text-base font-semibold">
              <GraduationCap className="h-5 w-5 mr-2" />
              MÜDEK Matrisi
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
                <CardHeader>
                  <CardTitle className="text-2xl text-[#0a294e]">İstatistikler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Öğrenme Çıktısı Sayısı</p>
                    <p className="text-3xl font-bold text-[#0a294e]">
                      {course.learningOutcomes?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Öğrenci Sayısı</p>
                    <p className="text-3xl font-bold text-[#0a294e]">
                      {course.students?.length || 0}
                    </p>
                  </div>
                  {(course as any).midtermExam && (
                    <div>
                      <p className="text-sm text-muted-foreground">Vize Sınav Kodu</p>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {(course as any).midtermExam.examCode}
                      </Badge>
                    </div>
                  )}
                  {(course as any).finalExam && (
                    <div>
                      <p className="text-sm text-muted-foreground">Final Sınav Kodu</p>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {(course as any).finalExam.examCode}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Learning Outcomes List */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <Card className="border-2 border-[#0a294e]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#0a294e]">Öğrenme Çıktıları (ÖÇ)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {course.learningOutcomes.map((lo, index) => (
                      <div
                        key={index}
                        className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#0a294e]/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Badge variant="default" className="bg-[#0a294e] text-white text-base px-3 py-1">
                            {lo.code}
                          </Badge>
                          <p className="text-lg flex-1">{lo.description}</p>
                        </div>
                        {(lo as any).programOutcomes && (lo as any).programOutcomes.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-muted-foreground mb-2">İlişkili Program Çıktıları:</p>
                            <div className="flex flex-wrap gap-2">
                              {(lo as any).programOutcomes.map((poCode: string) => (
                                <Badge key={poCode} variant="outline" className="text-sm">
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

          {/* MÜDEK Matrix Tab */}
          <TabsContent value="matrix">
            <MudekMatrix courseId={courseId} course={course} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// MÜDEK Matrix Component
function MudekMatrix({ courseId, course }: { courseId: string; course: Course }) {
  const [matrix, setMatrix] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMatrix();
  }, [courseId]);

  const loadMatrix = async () => {
    try {
      setIsLoading(true);
      const data = await courseApi.getMatrix(courseId);
      setMatrix(data.data);
    } catch (error: any) {
      console.error("Matrix yüklenirken hata:", error);
      toast.error(error?.response?.data?.message || "Matris yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-[#0a294e]/20">
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0a294e] mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Matris yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  if (!matrix || !matrix.rows || matrix.rows.length === 0) {
    return (
      <Card className="border-2 border-yellow-200">
        <CardContent className="p-8 text-center">
          <p className="text-lg text-muted-foreground">
            Bu ders için MÜDEK matrisi oluşturulamadı. Öğrenme çıktıları ve program çıktıları tanımlanmış olmalıdır.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-[#0a294e]/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-[#0a294e]">MÜDEK ÖÇ → PÇ Matrisi</CardTitle>
            <CardDescription className="text-base mt-2">
              Öğrenme Çıktıları (ÖÇ) ve Program Çıktıları (PÇ) arasındaki ilişki matrisi
            </CardDescription>
          </div>
          <Button onClick={handleExportPDF} className="h-11 px-5 bg-[#0a294e] hover:bg-[#0a294e]/90">
            <Download className="h-4 w-4 mr-2" />
            PDF İndir
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-gray-300 text-sm">
            <thead>
              <tr>
                <th className="border-2 border-gray-300 p-3 bg-[#0a294e] text-white text-left font-semibold">
                  ÖÇ / PÇ
                </th>
                {matrix.columns.map((pc: string) => (
                  <th
                    key={pc}
                    className="border-2 border-gray-300 p-3 bg-[#0a294e] text-white text-center font-semibold"
                  >
                    {pc}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((row: any) => (
                <tr key={row.ocCode} className="hover:bg-gray-50">
                  <td className="border-2 border-gray-300 p-3 font-semibold bg-gray-100">
                    {row.ocCode}
                  </td>
                  {matrix.columns.map((pc: string) => (
                    <td
                      key={pc}
                      className="border-2 border-gray-300 p-3 text-center"
                    >
                      {row.mapping[pc] === 1 ? (
                        <span className="inline-block w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                          ✓
                        </span>
                      ) : (
                        <span className="inline-block w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                          -
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Açıklama:</strong> Bu matris, her Öğrenme Çıktısının (ÖÇ) hangi Program Çıktılarına (PÇ) katkıda bulunduğunu gösterir. 
            ✓ işareti, ilgili ÖÇ'nin o PÇ'ye katkıda bulunduğunu gösterir.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

