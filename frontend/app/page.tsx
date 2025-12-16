"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Target, FileText, Users, GraduationCap, BarChart3, Plus, ArrowRight, Loader2 } from "lucide-react";
import { courseApi } from "@/lib/api/courseApi";
import { examApi } from "@/lib/api/examApi";
import { studentApi } from "@/lib/api/studentApi";
import { learningOutcomeApi } from "@/lib/api/learningOutcomeApi";
import { departmentApi } from "@/lib/api/departmentApi";
import { programOutcomeApi } from "@/lib/api/programOutcomeApi";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalLearningOutcomes: 0,
    totalExams: 0,
    totalStudents: 0,
    totalDepartments: 0,
    totalProgramOutcomes: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      
      const [courses, exams, students, departments] = await Promise.all([
        courseApi.getAll().catch(() => []),
        examApi.getAll().catch(() => []),
        studentApi.getAll().catch(() => []),
        departmentApi.getAll().catch(() => []),
      ]);

      // Calculate total learning outcomes from LearningOutcome collection
      // This is more accurate than counting embedded arrays in courses
      const allLearningOutcomes = await learningOutcomeApi.getAll().catch(() => []);
      const totalLOs = allLearningOutcomes.length;
      
      console.log("📊 Dashboard Stats - Total Courses:", courses.length);
      console.log("📊 Dashboard Stats - Total ÖÇs:", totalLOs);

      // Calculate total program outcomes from all programs
      // Get all programs (without department filter to get all)
      const { programApi } = await import("@/lib/api/programApi");
      const allPrograms = await programApi.getAll().catch(() => []);
      
      // Count ALL program outcomes across all programs
      // Each program can have its own set of PÇs, so we count all of them
      let totalPOs = 0;
      allPrograms.forEach((program: any) => {
        if (program.programOutcomes && Array.isArray(program.programOutcomes)) {
          totalPOs += program.programOutcomes.length;
        }
      });
      
      console.log("📊 Dashboard Stats - Total Programs:", allPrograms.length);
      console.log("📊 Dashboard Stats - Total PÇs:", totalPOs);
      allPrograms.forEach((program: any) => {
        if (program.programOutcomes && Array.isArray(program.programOutcomes)) {
          console.log(`  - Program ${program.name}: ${program.programOutcomes.length} PÇ`);
        }
      });

      setStats({
        totalCourses: courses.length,
        totalLearningOutcomes: totalLOs,
        totalExams: exams.length,
        totalStudents: students.length,
        totalDepartments: departments.length,
        totalProgramOutcomes: totalPOs,
      });
    } catch (error: any) {
      console.error("Dashboard stats fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">MEDEK Yönetim Paneli</h1>
          <p className="text-muted-foreground text-base">
            Sistem genelinde özet bilgiler ve hızlı erişim
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card className="border-2 border-slate-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Toplam Ders</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mb-1" />
                  ) : (
                    <p className="text-3xl font-bold text-slate-900">{stats.totalCourses}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Aktif dersler</p>
                </div>
                <div className="p-3 bg-[#0a294e]/10 dark:bg-[#0a294e]/20 rounded-lg">
                  <BookOpen className="h-6 w-6 text-[#0a294e] dark:text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Öğrenme Çıktıları</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mb-1" />
                  ) : (
                    <p className="text-3xl font-bold text-slate-900 dark:text-foreground">{stats.totalLearningOutcomes}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Tanımlı ÖÇ</p>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <Target className="h-6 w-6 text-slate-700 dark:text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Toplam Sınav</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mb-1" />
                  ) : (
                    <p className="text-3xl font-bold text-slate-900 dark:text-foreground">{stats.totalExams}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Oluşturulan sınavlar</p>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <FileText className="h-6 w-6 text-slate-700 dark:text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Öğrenciler</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mb-1" />
                  ) : (
                    <p className="text-3xl font-bold text-slate-900 dark:text-foreground">{stats.totalStudents}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Kayıtlı öğrenciler</p>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <Users className="h-6 w-6 text-slate-700 dark:text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Bölümler</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mb-1" />
                  ) : (
                    <p className="text-3xl font-bold text-slate-900 dark:text-foreground">{stats.totalDepartments}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Farklı bölüm</p>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-slate-700 dark:text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Program Çıktıları</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mb-1" />
                  ) : (
                    <p className="text-3xl font-bold text-slate-900 dark:text-foreground">{stats.totalProgramOutcomes}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Tanımlı PÇ</p>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-slate-700 dark:text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 border-slate-200 hover:border-[#0a294e] transition-colors cursor-pointer"
            onClick={() => router.push("/dashboard/courses")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Derslerim</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-foreground">Dersleri Yönet</p>
                </div>
                <ArrowRight className="h-5 w-5 text-[#0a294e] dark:text-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 hover:border-[#0a294e] transition-colors cursor-pointer"
            onClick={() => router.push("/exams")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Sınavlar</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-foreground">Sınavları Yönet</p>
                </div>
                <ArrowRight className="h-5 w-5 text-[#0a294e] dark:text-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 hover:border-[#0a294e] transition-colors cursor-pointer"
            onClick={() => router.push("/students")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Öğrenciler</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-foreground">Öğrencileri Yönet</p>
                </div>
                <ArrowRight className="h-5 w-5 text-[#0a294e] dark:text-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 hover:border-[#0a294e] transition-colors cursor-pointer"
            onClick={() => router.push("/reports")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Raporlar</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-foreground">Raporları Görüntüle</p>
                </div>
                <ArrowRight className="h-5 w-5 text-[#0a294e] dark:text-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-2 border-slate-200">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-700">
            <CardTitle className="text-xl text-slate-900 dark:text-foreground">Hızlı Erişim</CardTitle>
            <CardDescription className="text-sm">
              Sık kullanılan işlemlere hızlıca erişin
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 justify-start hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => router.push("/dashboard/courses")}
              >
                <Plus className="h-5 w-5 mr-3 text-[#0a294e] dark:text-foreground" />
                <div className="text-left">
                  <p className="font-semibold dark:text-foreground">Yeni Ders Oluştur</p>
                  <p className="text-xs text-muted-foreground">Yeni bir ders ekleyin</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => router.push("/exams/new")}
              >
                <Plus className="h-5 w-5 mr-3 text-[#0a294e] dark:text-foreground" />
                <div className="text-left">
                  <p className="font-semibold dark:text-foreground">Yeni Sınav Oluştur</p>
                  <p className="text-xs text-muted-foreground">Yeni bir sınav ekleyin</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => router.push("/students/new")}
              >
                <Plus className="h-5 w-5 mr-3 text-[#0a294e] dark:text-foreground" />
                <div className="text-left">
                  <p className="font-semibold dark:text-foreground">Yeni Öğrenci Ekle</p>
                  <p className="text-xs text-muted-foreground">Sisteme öğrenci ekleyin</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => router.push("/outcomes/new")}
              >
                <Plus className="h-5 w-5 mr-3 text-[#0a294e] dark:text-foreground" />
                <div className="text-left">
                  <p className="font-semibold dark:text-foreground">Yeni Öğrenme Çıktısı</p>
                  <p className="text-xs text-muted-foreground">ÖÇ tanımlayın</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => router.push("/dashboard/program-outcomes")}
              >
                <Plus className="h-5 w-5 mr-3 text-[#0a294e] dark:text-foreground" />
                <div className="text-left">
                  <p className="font-semibold dark:text-foreground">Program Çıktıları</p>
                  <p className="text-xs text-muted-foreground">PÇ yönetimi</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => router.push("/reports")}
              >
                <BarChart3 className="h-5 w-5 mr-3 text-[#0a294e] dark:text-foreground" />
                <div className="text-left">
                  <p className="font-semibold">Raporları Görüntüle</p>
                  <p className="text-xs text-muted-foreground">Analiz ve raporlar</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

