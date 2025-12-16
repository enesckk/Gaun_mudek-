"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, X } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { OutcomeTable } from "@/components/outcomes/OutcomeTable";
import { learningOutcomeApi, type LearningOutcome } from "@/lib/api/learningOutcomeApi";
import { courseApi, type Course } from "@/lib/api/courseApi";
import { departmentApi, type Department } from "@/lib/api/departmentApi";
import { programApi, type Program } from "@/lib/api/programApi";

export default function OutcomesPage() {
  const router = useRouter();
  const [outcomes, setOutcomes] = useState<LearningOutcome[]>([]);
  const [filteredOutcomes, setFilteredOutcomes] = useState<LearningOutcome[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllOutcomes();
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartmentId) {
      loadPrograms(selectedDepartmentId);
      if (!selectedProgramId) {
        loadCoursesByDepartment(selectedDepartmentId);
      }
    } else {
      setPrograms([]);
      setSelectedProgramId("");
      setSelectedCourseId("");
      loadAllCourses();
    }
  }, [selectedDepartmentId]);

  useEffect(() => {
    if (selectedProgramId) {
      loadCoursesByProgram(selectedProgramId);
    } else if (selectedDepartmentId) {
      loadCoursesByDepartment(selectedDepartmentId);
    } else {
      loadAllCourses();
    }
  }, [selectedProgramId, selectedDepartmentId]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedDepartmentId, selectedProgramId, selectedCourseId, outcomes]);

  const loadDepartments = async () => {
    try {
      const data = await departmentApi.getAll();
      setDepartments(data);
    } catch (error: any) {
      console.error("Bölümler yüklenemedi:", error);
    }
  };

  const loadPrograms = async (deptId: string) => {
    try {
      setLoadingPrograms(true);
      console.log("🔍 [Outcomes Page] Loading programs for department:", deptId);
      const data = await programApi.getAll(deptId);
      console.log("📦 [Outcomes Page] Programs received:", data);
      setPrograms(data || []);
      console.log(`✅ [Outcomes Page] ${data?.length || 0} program(s) loaded`);
    } catch (error: any) {
      console.error("❌ [Outcomes Page] Programlar yüklenemedi:", error);
      console.error("Error details:", error.response?.data || error.message);
      setPrograms([]);
    } finally {
      setLoadingPrograms(false);
    }
  };

  const loadAllCourses = async () => {
    try {
      const data = await courseApi.getAll();
      setCourses(data);
    } catch (error: any) {
      console.error("Dersler yüklenemedi:", error);
    }
  };

  const loadCoursesByDepartment = async (departmentId: string) => {
    try {
      const allCourses = await courseApi.getAll();
      const deptCourses = allCourses.filter((course: any) => {
        const deptId = typeof course.department === "object" && course.department !== null
          ? (course.department as any)._id
          : course.department;
        return deptId === departmentId;
      });
      setCourses(deptCourses);
      // Reset course selection if selected course is not in new list
      if (selectedCourseId && !deptCourses.find((c: any) => c._id === selectedCourseId)) {
        setSelectedCourseId("");
      }
    } catch (error: any) {
      console.error("Dersler yüklenemedi:", error);
    }
  };

  const loadCoursesByProgram = async (programId: string) => {
    try {
      const allCourses = await courseApi.getAll();
      const programCourses = allCourses.filter((course: any) => {
        const progId = typeof course.program === "object" && course.program !== null
          ? (course.program as any)._id
          : course.program;
        return progId === programId;
      });
      setCourses(programCourses);
      // Reset course selection if selected course is not in new list
      if (selectedCourseId && !programCourses.find((c: any) => c._id === selectedCourseId)) {
        setSelectedCourseId("");
      }
    } catch (error: any) {
      console.error("Dersler yüklenemedi:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...outcomes];

    // Filter by department
    if (selectedDepartmentId) {
      filtered = filtered.filter((outcome: any) => {
        const deptId = outcome.department?._id || outcome.department;
        return deptId === selectedDepartmentId;
      });
    }

    // Filter by program
    if (selectedProgramId) {
      filtered = filtered.filter((outcome: any) => {
        const course = outcome.course;
        if (!course) return false;
        const progId =
          typeof course.program === "object" && course.program !== null
            ? (course.program as any)._id
            : course.program;
        return progId === selectedProgramId;
      });
    }

    // Filter by course
    if (selectedCourseId) {
      filtered = filtered.filter((outcome: any) => {
        return outcome.course?._id === selectedCourseId;
      });
    }

    // Filter by search query
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((outcome: any) => {
        const code = (outcome.code || "").toLowerCase();
        const description = (outcome.description || "").toLowerCase();
        const courseName = (outcome.course?.name || "").toLowerCase();
        const courseCode = (outcome.course?.code || "").toLowerCase();
        const departmentName = outcome.department?.name 
          ? (typeof outcome.department === 'string' 
            ? outcome.department.toLowerCase() 
            : outcome.department.name.toLowerCase())
          : "";
        
        return (
          code.includes(query) ||
          description.includes(query) ||
          courseName.includes(query) ||
          courseCode.includes(query) ||
          departmentName.includes(query)
        );
      });
    }

    setFilteredOutcomes(filtered);
  };

  const clearFilters = () => {
    setSelectedDepartmentId("");
    setSelectedCourseId("");
    setSearchQuery("");
  };

  const fetchAllOutcomes = async () => {
    try {
      setIsLoading(true);
      // Fetch all courses and then get outcomes for each
      const courses = await courseApi.getAll();
      const allOutcomes: (LearningOutcome & { course?: any; department?: any })[] = [];

      // Create a map of courseId to course for quick lookup
      const courseMap = new Map();
      courses.forEach((course: any) => {
        courseMap.set(course._id, course);
      });

      for (const course of courses) {
        try {
          const courseOutcomes = await learningOutcomeApi.getByCourse(course._id);
          // Add course and department info to each outcome
          // Also check Course's embedded learningOutcomes for programOutcomes
          const enrichedOutcomes = courseOutcomes.map((outcome) => {
            // Check if course has embedded learningOutcomes with programOutcomes
            const embeddedLO = (course as any).learningOutcomes?.find(
              (lo: any) => lo.code === outcome.code
            );
            
            // Use programOutcomes from embedded LO if available, otherwise use mappedProgramOutcomes
            const programOutcomes = embeddedLO?.programOutcomes || outcome.mappedProgramOutcomes || [];
            
            return {
              ...outcome,
              course: course,
              department: (course as any).department || (typeof (course as any).department === 'string' ? null : (course as any).department),
              mappedProgramOutcomes: programOutcomes, // Ensure we use the correct field
            };
          });
          allOutcomes.push(...enrichedOutcomes);
        } catch (error) {
          // Skip courses without outcomes
          console.error(`Failed to fetch outcomes for course ${course._id}`);
        }
      }

      setOutcomes(allOutcomes);
      setFilteredOutcomes(allOutcomes);
    } catch (error: any) {
      const errorMessage = error?.isNetworkError
        ? error.message || "Backend sunucusuna bağlanılamıyor. Lütfen backend'in çalıştığından emin olun."
        : error?.response?.data?.message || "Öğrenme çıktıları yüklenirken hata oluştu";
      toast.error(errorMessage);
      console.error("Outcomes fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm sm:text-base">
          Tüm derslerin öğrenme çıktılarını görüntüleyin, yönetin ve program çıktıları ile eşleştirin
        </p>
        <Button 
          onClick={() => router.push("/outcomes/new")}
          className="w-full sm:w-auto h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Yeni Öğrenme Çıktısı</span>
          <span className="sm:hidden">Yeni ÖÇ</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Öğrenme Çıktıları Listesi</CardTitle>
          <CardDescription>
            Sistemdeki tüm öğrenme çıktıları. Her ÖÇ kodu yanında ders adı ve bölüm bilgisi gösterilmektedir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Filtreler</Label>
              {(selectedDepartmentId || selectedProgramId || selectedCourseId || searchQuery.trim() !== "") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Filtreleri Temizle
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Department Filter */}
              <div className="space-y-2">
                <Label htmlFor="department-filter" className="text-sm font-medium">
                  Bölüm
                </Label>
                <Select
                  id="department-filter"
                  value={selectedDepartmentId}
                  onChange={(e) => setSelectedDepartmentId(e.target.value)}
                  className="h-10 text-sm"
                >
                  <option value="">Tüm Bölümler</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Program Filter */}
              <div className="space-y-2">
                <Label htmlFor="program-filter" className="text-sm font-medium">
                  Program
                </Label>
                <Select
                  id="program-filter"
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  disabled={!selectedDepartmentId || loadingPrograms}
                  className="h-10 text-sm"
                >
                  <option value="">
                    {!selectedDepartmentId 
                      ? "Önce bölüm seçin" 
                      : loadingPrograms
                      ? "Yükleniyor..."
                      : "Tüm Programlar"}
                  </option>
                  {programs.map((prog) => (
                    <option key={prog._id} value={prog._id}>
                      {prog.name} {prog.code ? `(${prog.code})` : ""}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Course Filter */}
              <div className="space-y-2">
                <Label htmlFor="course-filter" className="text-sm font-medium">
                  Ders
                </Label>
                <Select
                  id="course-filter"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="h-10 text-sm"
                  disabled={!selectedDepartmentId && departments.length > 0}
                >
                  <option value="">Tüm Dersler</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search-input" className="text-sm font-medium">
                  Arama
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-input"
                    placeholder="Kod, açıklama, ders veya bölüm ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Badges */}
            {(selectedDepartmentId || selectedProgramId || selectedCourseId || searchQuery.trim() !== "") && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                <span className="text-xs text-muted-foreground">Aktif Filtreler:</span>
                {selectedDepartmentId && (
                  <Badge variant="secondary" className="text-xs">
                    Bölüm: {departments.find(d => d._id === selectedDepartmentId)?.name}
                    <button
                      onClick={() => setSelectedDepartmentId("")}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedProgramId && (
                  <Badge variant="secondary" className="text-xs">
                    Program: {programs.find(p => p._id === selectedProgramId)?.name || selectedProgramId}
                    <button
                      onClick={() => setSelectedProgramId("")}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedCourseId && (
                  <Badge variant="secondary" className="text-xs">
                    Ders: {courses.find(c => c._id === selectedCourseId)?.code}
                    <button
                      onClick={() => setSelectedCourseId("")}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {searchQuery.trim() !== "" && (
                  <Badge variant="secondary" className="text-xs">
                    Arama: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery("")}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Öğrenme çıktıları yükleniyor...
            </div>
          ) : (
            <OutcomeTable outcomes={filteredOutcomes} onDelete={fetchAllOutcomes} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}






