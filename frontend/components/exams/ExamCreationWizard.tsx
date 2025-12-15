"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  FileText, 
  Settings, 
  Target, 
  Eye,
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  examApi,
  type CreateExamDto,
  type Exam,
} from "@/lib/api/examApi";
import { courseApi, type Course } from "@/lib/api/courseApi";
import { departmentApi, type Department } from "@/lib/api/departmentApi";
import { programApi, type Program } from "@/lib/api/programApi";

interface ExamCreationWizardProps {
  onSuccess?: () => void;
}

type QuestionRow = {
  questionNumber: number;
  learningOutcomeCode: string;
};

type WizardStep = 1 | 2 | 3 | 4;

export function ExamCreationWizard({ onSuccess }: ExamCreationWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [examType, setExamType] = useState<"midterm" | "final">("midterm");
  const [examCode, setExamCode] = useState("");
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [maxScorePerQuestion, setMaxScorePerQuestion] = useState<number>(0);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [existingExams, setExistingExams] = useState<Exam[]>([]);
  const [examCodeError, setExamCodeError] = useState("");

  const loadDepartments = async () => {
    try {
      const data = await departmentApi.getAll();
      setDepartments(data);
    } catch (error) {
      console.error("Bölümler yüklenemedi:", error);
    }
  };

  const loadPrograms = async (deptId: string) => {
    try {
      setLoadingPrograms(true);
      console.log("🔍 [Exams Wizard] Loading programs for department:", deptId);
      const data = await programApi.getAll(deptId);
      console.log("📦 [Exams Wizard] Programs received:", data);
      setPrograms(data || []);
      console.log(`✅ [Exams Wizard] ${data?.length || 0} program(s) loaded`);
    } catch (error: any) {
      console.error("❌ [Exams Wizard] Programlar yüklenemedi:", error);
      console.error("Error details:", error.response?.data || error.message);
      setPrograms([]);
    } finally {
      setLoadingPrograms(false);
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
      if (courseId && !programCourses.find((c: any) => c._id === courseId)) {
        setCourseId("");
      }
    } catch (error) {
      toast.error("Dersler yüklenemedi");
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
      if (courseId && !deptCourses.find((c: any) => c._id === courseId)) {
        setCourseId("");
      }
    } catch (error) {
      toast.error("Dersler yüklenemedi");
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await courseApi.getAll();
      setCourses(data);
    } catch (error) {
      toast.error("Dersler yüklenemedi");
    }
  };

  useEffect(() => {
    fetchCourses();
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartmentId) {
      loadPrograms(selectedDepartmentId);
    } else {
      setPrograms([]);
      setSelectedProgramId("");
    }
  }, [selectedDepartmentId]);

  useEffect(() => {
    if (selectedProgramId) {
      loadCoursesByProgram(selectedProgramId);
    } else {
      // If no program selected, show all courses or courses filtered by department
      if (selectedDepartmentId) {
        loadCoursesByDepartment(selectedDepartmentId);
      } else {
        fetchCourses();
      }
    }
  }, [selectedProgramId, selectedDepartmentId]);

  useEffect(() => {
    if (courseId) {
      checkExamCode();
    } else {
      setExamCodeError("");
      setExistingExams([]);
    }
  }, [courseId, examCode]);

  const checkExamCode = async () => {
    if (!courseId || !examCode.trim()) {
      setExamCodeError("");
      return;
    }

    try {
      const courseExams = await examApi.getByCourse(courseId);
      setExistingExams(courseExams);
      const duplicate = courseExams.find(
        (exam) => exam.examCode.trim().toLowerCase() === examCode.trim().toLowerCase()
      );
      if (duplicate) {
        setExamCodeError(`"${examCode.trim()}" sınav kodu bu ders için zaten mevcut. Aynı ders içinde aynı sınav kodu kullanılamaz.`);
      } else {
        setExamCodeError("");
      }
    } catch (error) {
      console.error("Sınav kontrolü yapılamadı:", error);
      setExamCodeError("");
    }
  };

  useEffect(() => {
    // questionCount değiştiğinde satırları otomatik üret
    if (questionCount < 0 || Number.isNaN(questionCount)) return;
    setQuestions((prev) => {
      const updated: QuestionRow[] = [];
      for (let i = 0; i < questionCount; i++) {
        const existing = prev.find((q) => q.questionNumber === i + 1);
        updated.push(
          existing || {
            questionNumber: i + 1,
            learningOutcomeCode: "",
          }
        );
      }
      return updated;
    });
  }, [questionCount]);

  const selectedCourse = useMemo(
    () => courses.find((c) => c._id === courseId),
    [courses, courseId]
  );

  const learningOutcomeOptions =
    selectedCourse?.learningOutcomes?.map((lo) => ({
      code: lo.code,
      label: `${lo.code} – ${lo.description}`,
      description: lo.description,
    })) || [];

  const handleQuestionLoChange = (index: number, loCode: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === index
          ? {
              ...q,
              learningOutcomeCode: loCode,
            }
          : q
      )
    );
  };

  const validateStep = (step: WizardStep): boolean => {
    switch (step) {
      case 1:
        if (!courseId) {
          toast.error("Ders seçimi zorunludur");
          return false;
        }
        if (!examCode.trim()) {
          toast.error("Sınav kodu zorunludur");
          return false;
        }
        if (examCodeError) {
          toast.error(examCodeError);
          return false;
        }
        return true;
      case 2:
        if (!questionCount || questionCount <= 0) {
          toast.error("Soru sayısı 1 veya daha büyük olmalıdır");
          return false;
        }
        if (!maxScorePerQuestion || maxScorePerQuestion <= 0) {
          toast.error("Soru başına maksimum puan zorunludur");
          return false;
        }
        return true;
      case 3:
        for (const q of questions) {
          if (!q.learningOutcomeCode) {
            toast.error(`Soru ${q.questionNumber} için ÖÇ seçmelisiniz`);
            return false;
          }
        }
        if (learningOutcomeOptions.length === 0) {
          toast.error("Bu ders için tanımlı öğrenme çıktısı yok");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((prev) => (prev + 1) as WizardStep);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setIsSubmitting(true);
    try {
      const payload: CreateExamDto = {
        courseId,
        examType,
        examCode: examCode.trim(),
        questionCount: Number(questionCount),
        maxScorePerQuestion: Number(maxScorePerQuestion),
        questions: questions.filter((q) => q.learningOutcomeCode.trim() !== ""),
      };

      await examApi.create(payload);
      toast.success("Sınav başarıyla oluşturuldu");
      
      // Dispatch event to notify other components (e.g., courses page)
      window.dispatchEvent(new CustomEvent('examCreated', { 
        detail: { courseId, examType: examType } 
      }));
      
      onSuccess?.();
      router.push("/exams");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Sınav kaydedilemedi";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / 4) * 100;

  // Özet hesaplamaları
  const mappedLOs = new Set(questions.map((q) => q.learningOutcomeCode).filter(Boolean));
  const totalMaxScore = questionCount * maxScorePerQuestion;
  const loDistribution = learningOutcomeOptions.map((lo) => ({
    code: lo.code,
    count: questions.filter((q) => q.learningOutcomeCode === lo.code).length,
  }));

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card className="border-2 border-[#0a294e]/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Sınav Oluşturma Sihirbazı</h3>
              <span className="text-sm text-muted-foreground">
                Adım {currentStep} / 4
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-[#0a294e] h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={currentStep >= 1 ? "font-semibold text-[#0a294e]" : "text-muted-foreground"}>
                1. Ders Bilgileri
              </span>
              <span className={currentStep >= 2 ? "font-semibold text-[#0a294e]" : "text-muted-foreground"}>
                2. Soru Ayarları
              </span>
              <span className={currentStep >= 3 ? "font-semibold text-[#0a294e]" : "text-muted-foreground"}>
                3. ÖÇ Eşleme
              </span>
              <span className={currentStep >= 4 ? "font-semibold text-[#0a294e]" : "text-muted-foreground"}>
                4. Özet
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Ders ve Sınav Bilgileri */}
      {currentStep === 1 && (
        <Card className="border-2 border-[#0a294e]/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-[#0a294e]" />
              <div>
                <CardTitle className="text-2xl">Ders ve Sınav Bilgileri</CardTitle>
                <CardDescription className="text-base mt-1">
                  Sınav için ders ve temel bilgileri girin
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Department and Program Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departmentId" className="text-base">
                  Bölüm
                </Label>
                <Select
                  id="departmentId"
                  value={selectedDepartmentId}
                  onChange={(e) => {
                    setSelectedDepartmentId(e.target.value);
                    setSelectedProgramId("");
                    setCourseId("");
                  }}
                  className="h-12 text-base"
                >
                  <option value="">Tüm Bölümler</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="programId" className="text-base">
                  Program
                </Label>
                <Select
                  id="programId"
                  value={selectedProgramId}
                  onChange={(e) => {
                    setSelectedProgramId(e.target.value);
                    setCourseId("");
                  }}
                  disabled={!selectedDepartmentId || loadingPrograms}
                  className="h-12 text-base"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="courseId" className="text-base">
                  Ders <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="courseId"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  disabled={!!(selectedProgramId && courses.length === 0)}
                  className="h-12 text-base"
                >
                  <option value="">
                    {selectedProgramId && courses.length === 0
                      ? "Bu program için ders bulunamadı"
                      : selectedProgramId
                      ? "Ders seçin"
                      : "Önce program seçin veya ders seçin"}
                  </option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </Select>
                {selectedCourse && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedCourse.learningOutcomes?.length || 0} öğrenme çıktısı tanımlı
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="examType" className="text-base">
                  Sınav Türü <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="examType"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as "midterm" | "final")}
                  className="h-12 text-base"
                >
                  <option value="midterm">Vize</option>
                  <option value="final">Final</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="examCode" className="text-base">
                Sınav Kodu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="examCode"
                value={examCode}
                onChange={(e) => setExamCode(e.target.value)}
                placeholder="Örn: VIZE-2025-1, FINAL-2025-1"
                className="h-12 text-base"
              />
              <p className="text-sm text-muted-foreground">
                Sınav kodunu benzersiz bir şekilde tanımlayın
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Soru Ayarları */}
      {currentStep === 2 && (
        <Card className="border-2 border-[#0a294e]/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-[#0a294e]" />
              <div>
                <CardTitle className="text-2xl">Soru Ayarları</CardTitle>
                <CardDescription className="text-base mt-1">
                  Sınav için soru sayısı ve puanlama ayarlarını yapın
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="questionCount" className="text-base">
                  Soru Sayısı <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="questionCount"
                  type="number"
                  min={1}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="h-12 text-base text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  Sınavda kaç soru olacak?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxScorePerQuestion" className="text-base">
                  Soru Başına Maksimum Puan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maxScorePerQuestion"
                  type="number"
                  min={1}
                  value={maxScorePerQuestion}
                  onChange={(e) => setMaxScorePerQuestion(Number(e.target.value))}
                  className="h-12 text-base text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  Her soru için maksimum puan
                </p>
              </div>
            </div>

            {questionCount > 0 && maxScorePerQuestion > 0 && (
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Toplam Maksimum Puan</p>
                      <p className="text-3xl font-bold text-[#0a294e]">{totalMaxScore}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-700">
                        {questionCount} soru × {maxScorePerQuestion} puan
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: ÖÇ Eşleme */}
      {currentStep === 3 && (
        <Card className="border-2 border-[#0a294e]/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-[#0a294e]" />
              <div>
                <CardTitle className="text-2xl">Soru → ÖÇ Eşleme</CardTitle>
                <CardDescription className="text-base mt-1">
                  Her soruyu ilgili öğrenme çıktısına (ÖÇ) eşleyin
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {learningOutcomeOptions.length === 0 ? (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Bu ders için henüz öğrenme çıktısı tanımlanmamış. 
                    Lütfen önce dersi düzenleyip öğrenme çıktıları ekleyin.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-3">
                  {questions.map((q, idx) => {
                    const selectedLO = learningOutcomeOptions.find(
                      (lo) => lo.code === q.learningOutcomeCode
                    );
                    return (
                      <Card
                        key={q.questionNumber}
                        className={`border-2 transition-colors ${
                          q.learningOutcomeCode
                            ? "border-green-300 bg-green-50/50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              <Badge
                                variant="default"
                                className={`text-lg px-4 py-2 ${
                                  q.learningOutcomeCode
                                    ? "bg-green-600"
                                    : "bg-gray-400"
                                }`}
                              >
                                Soru {q.questionNumber}
                              </Badge>
                            </div>
                            <div className="flex-1">
                              <Select
                                value={q.learningOutcomeCode}
                                onChange={(e) => handleQuestionLoChange(idx, e.target.value)}
                                className="h-11"
                              >
                                <option value="">ÖÇ seçin...</option>
                                {learningOutcomeOptions.map((opt) => (
                                  <option key={opt.code} value={opt.code}>
                                    {opt.label}
                                  </option>
                                ))}
                              </Select>
                            </div>
                            {selectedLO && (
                              <div className="flex-shrink-0">
                                <Badge variant="outline" className="bg-white">
                                  {selectedLO.code}
                                </Badge>
                              </div>
                            )}
                          </div>
                          {selectedLO && (
                            <p className="text-sm text-muted-foreground mt-2 ml-20">
                              {selectedLO.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* ÖÇ Dağılım Özeti */}
                {mappedLOs.size > 0 && (
                  <Card className="bg-slate-50 border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg">ÖÇ Dağılım Özeti</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {loDistribution
                          .filter((dist) => dist.count > 0)
                          .map((dist) => (
                            <Badge
                              key={dist.code}
                              variant="outline"
                              className="bg-white text-slate-700 border-slate-300"
                            >
                              {dist.code}: {dist.count} soru
                            </Badge>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Özet */}
      {currentStep === 4 && (
        <Card className="border-2 border-[#0a294e]/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-[#0a294e]" />
              <div>
                <CardTitle className="text-2xl">Özet ve Onay</CardTitle>
                <CardDescription className="text-base mt-1">
                  Sınav bilgilerini kontrol edin ve onaylayın
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ders Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-50 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Ders Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Ders</p>
                    <p className="font-semibold">
                      {selectedCourse?.code} - {selectedCourse?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sınav Türü</p>
                    <Badge variant="outline">
                      {examType === "midterm" ? "Vize" : "Final"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sınav Kodu</p>
                    <p className="font-semibold">{examCode}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg">Soru Ayarları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Soru Sayısı</p>
                    <p className="text-2xl font-bold text-green-600">{questionCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Soru Başına Max Puan</p>
                    <p className="text-2xl font-bold text-green-600">{maxScorePerQuestion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Toplam Max Puan</p>
                    <p className="text-2xl font-bold text-green-600">{totalMaxScore}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ÖÇ Eşleme Özeti */}
            <Card className="bg-slate-50 border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">ÖÇ Eşleme Özeti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {mappedLOs.size} farklı öğrenme çıktısı kullanılıyor
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {loDistribution
                      .filter((dist) => dist.count > 0)
                      .map((dist) => (
                        <div
                          key={dist.code}
                          className="p-3 bg-white rounded-lg border border-slate-200"
                        >
                          <p className="font-semibold text-slate-700">{dist.code}</p>
                          <p className="text-sm text-muted-foreground">
                            {dist.count} soru
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Soru Listesi */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Soru Listesi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {questions.map((q) => {
                    const lo = learningOutcomeOptions.find(
                      (opt) => opt.code === q.learningOutcomeCode
                    );
                    return (
                      <div
                        key={q.questionNumber}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Soru {q.questionNumber}</Badge>
                          <span className="font-semibold">{lo?.code || "ÖÇ seçilmedi"}</span>
                          {lo && (
                            <span className="text-sm text-muted-foreground">
                              {lo.description}
                            </span>
                          )}
                        </div>
                        <Badge variant="outline" className="bg-white">
                          {maxScorePerQuestion} puan
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || isSubmitting}
          className="h-12 px-6"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>

        {currentStep < 4 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="h-12 px-6 bg-[#0a294e] hover:bg-[#0a294e]/90"
          >
            İleri
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-12 px-6 bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Sınavı Oluştur
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

