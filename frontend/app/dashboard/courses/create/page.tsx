"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ChevronDown, ChevronUp, BookOpen, GraduationCap, FileText, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { OutcomeEditor, type LearningOutcome } from "@/components/courses/OutcomeEditor";
import { ExamSettingsComponent, type ExamSettings } from "@/components/courses/ExamSettings";
import { StudentImporter, type Student } from "@/components/courses/StudentImporter";
import { courseApi } from "@/lib/api/courseApi";
import { departmentApi, type Department } from "@/lib/api/departmentApi";

export default function CreateCoursePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    courseInfo: true,
    learningOutcomes: true,
    examSettings: true,
    studentImport: true,
  });

  // Section 1: Course Information
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [semester, setSemester] = useState("");
  const [description, setDescription] = useState("");

  // Section 2: Learning Outcomes
  // Start with first outcome pre-filled with ÖÇ1
  const [learningOutcomes, setLearningOutcomes] = useState<LearningOutcome[]>([
    { code: "ÖÇ1", description: "", programOutcomes: [] },
  ]);

  // Section 4: Exam Settings
  const [midtermExam, setMidtermExam] = useState<ExamSettings>({
    examCode: "",
    questionCount: 0,
    maxScorePerQuestion: 0,
  });
  const [finalExam, setFinalExam] = useState<ExamSettings>({
    examCode: "",
    questionCount: 0,
    maxScorePerQuestion: 0,
  });

  // Section 5: Students
  const [students, setStudents] = useState<Student[]>([]);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Refs for scrolling to errors
  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const data = await departmentApi.getAll();
      if (data && data.length > 0) {
        setDepartments(data);
      } else {
        setDepartments([]);
        console.log("Henüz bölüm tanımlanmamış");
      }
    } catch (error: any) {
      console.error("Bölümler yüklenirken hata:", error);
      const errorMessage = error.response?.data?.message || error.message || "Bölümler yüklenemedi";
      toast.error(errorMessage);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // Section 1: Course Information
    if (!name.trim()) {
      newErrors.name = "Ders adı gereklidir";
    }
    if (!code.trim()) {
      newErrors.code = "Ders kodu gereklidir";
    } else if (!/^[A-Z0-9]+$/.test(code.trim())) {
      newErrors.code = "Ders kodu sadece büyük harf ve rakam içermelidir";
    }
    if (!departmentId.trim()) {
      newErrors.department = "Lütfen bir bölüm seçin.";
    }
    if (!semester.trim()) {
      newErrors.semester = "Dönem gereklidir";
    }

    // Section 2: Learning Outcomes
    if (learningOutcomes.length === 0) {
      newErrors.learningOutcomes = "En az bir öğrenme çıktısı eklemelisiniz";
    } else {
      learningOutcomes.forEach((lo, index) => {
        if (!lo.code.trim()) {
          newErrors[`lo_${index}_code`] = "ÖÇ Kodu gereklidir";
        }
        if (!lo.description.trim()) {
          newErrors[`lo_${index}_description`] = "Açıklama gereklidir";
        }
      });
    }

    // Section 4: Exam Settings
    if (!midtermExam.examCode.trim()) {
      newErrors.midtermExamCode = "Vize sınav kodu gereklidir";
    } else if (!/^\d{2}$/.test(midtermExam.examCode.trim())) {
      newErrors.midtermExamCode = "Vize sınav kodu 2 haneli sayı olmalıdır";
    }
    if (!midtermExam.questionCount || midtermExam.questionCount < 1) {
      newErrors.midtermQuestionCount = "Vize soru sayısı en az 1 olmalıdır";
    }
    if (!midtermExam.maxScorePerQuestion || midtermExam.maxScorePerQuestion <= 0) {
      newErrors.midtermMaxScore = "Vize soru başına maksimum puan gereklidir";
    }

    if (!finalExam.examCode.trim()) {
      newErrors.finalExamCode = "Final sınav kodu gereklidir";
    } else if (!/^\d{2}$/.test(finalExam.examCode.trim())) {
      newErrors.finalExamCode = "Final sınav kodu 2 haneli sayı olmalıdır";
    }
    if (!finalExam.questionCount || finalExam.questionCount < 1) {
      newErrors.finalQuestionCount = "Final soru sayısı en az 1 olmalıdır";
    }
    if (!finalExam.maxScorePerQuestion || finalExam.maxScorePerQuestion <= 0) {
      newErrors.finalMaxScore = "Final soru başına maksimum puan gereklidir";
    }

    if (midtermExam.examCode === finalExam.examCode && midtermExam.examCode) {
      newErrors.examCodeMatch = "Vize ve Final sınav kodları farklı olmalıdır";
      newErrors.midtermExamCode = "Vize ve Final sınav kodları farklı olmalıdır";
      newErrors.finalExamCode = "Vize ve Final sınav kodları farklı olmalıdır";
    }

    // Section 5: Students
    if (students.length === 0) {
      newErrors.students = "En az bir öğrenci eklemelisiniz";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Lütfen formdaki hataları düzeltin");
      // Scroll to first error
      const firstErrorRef =
        Object.keys(validationErrors)
          .map((key) => errorRefs.current[key])
          .find(Boolean) || Object.values(errorRefs.current).find(Boolean);
      if (firstErrorRef) {
        firstErrorRef.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        semester: semester.trim(),
        departmentId: departmentId.trim(),
        description: description.trim() || undefined,
        learningOutcomes: learningOutcomes
          .filter((lo) => lo.code.trim() && lo.description.trim())
          .map((lo) => ({
            code: lo.code.trim(),
            description: lo.description.trim(),
            programOutcomes: lo.programOutcomes || [],
          })),
        midtermExam: {
          examCode: midtermExam.examCode.trim(),
          questionCount: midtermExam.questionCount,
          maxScorePerQuestion: midtermExam.maxScorePerQuestion,
        },
        finalExam: {
          examCode: finalExam.examCode.trim(),
          questionCount: finalExam.questionCount,
          maxScorePerQuestion: finalExam.maxScorePerQuestion,
        },
        students: students.map((s) => ({
          studentNumber: s.studentNumber.trim(),
          fullName: s.fullName.trim(),
        })),
      };

      const response = await courseApi.createCourse(payload);
      if (response.data?.success) {
        toast.success("Ders başarıyla oluşturuldu");
        router.push("/dashboard/courses");
      } else {
        throw new Error(response.data?.message || response.data?.error || "Ders oluşturulamadı");
      }
    } catch (error: any) {
      console.error("Course creation error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Ders oluşturulamadı. Lütfen bilgileri kontrol edin.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const semestersOptions = ["Güz 2024", "Bahar 2025", "Yaz 2025"];

  return (
    <div className="min-h-screen bg-[#fff] p-6 pb-32">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-[#0a294e] rounded-xl shadow-md">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-[#0a294e]">
                Yeni Ders Oluştur
              </h1>
              <p className="text-slate-600 text-lg mt-1">
                Yeni bir ders eklemek için aşağıdaki bilgileri doldurun
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Course Information */}
          <Card className="rounded-2xl shadow-lg border-2 border-gray-200 bg-white hover:shadow-xl transition-shadow duration-300">
            <CardHeader
              className="cursor-pointer flex flex-row items-center justify-between bg-[#0a294e]/5 rounded-t-2xl p-6 hover:bg-[#0a294e]/10 transition-colors"
              onClick={() => toggleSection("courseInfo")}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[#0a294e] rounded-lg shadow-md">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#0a294e]">Ders Bilgileri</CardTitle>
              </div>
              {expandedSections.courseInfo ? (
                <ChevronUp className="h-6 w-6 text-[#0a294e]" />
              ) : (
                <ChevronDown className="h-6 w-6 text-[#0a294e]" />
              )}
            </CardHeader>
            {expandedSections.courseInfo && (
              <CardContent className="p-8 pt-6 space-y-6 bg-white">
                <div ref={(el) => { errorRefs.current.name = el; }} className="space-y-3">
                  <Label htmlFor="name" className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    Ders Adı <span className="text-[#bf1e1d] font-bold">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Veri Yapıları ve Algoritmalar"
                    className={`h-14 text-lg border-2 transition-all ${
                      errors.name 
                        ? "border-[#bf1e1d] focus:border-[#bf1e1d] focus:ring-[#bf1e1d]/20" 
                        : "border-gray-300 focus:border-[#0a294e] focus:ring-[#0a294e]/20"
                    } rounded-xl shadow-sm`}
                  />
                  {errors.name && (
                    <p className="text-sm font-medium text-[#bf1e1d] bg-[#bf1e1d]/10 p-2 rounded-lg">{errors.name}</p>
                  )}
                </div>

                <div ref={(el) => { errorRefs.current.code = el; }} className="space-y-3">
                  <Label htmlFor="code" className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    Ders Kodu <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Örn: CS201"
                    className={`h-14 text-lg border-2 transition-all ${
                      errors.code 
                        ? "border-[#bf1e1d] focus:border-[#bf1e1d] focus:ring-[#bf1e1d]/20" 
                        : "border-gray-300 focus:border-[#0a294e] focus:ring-[#0a294e]/20"
                    } rounded-xl shadow-sm font-mono`}
                  />
                  {errors.code && (
                    <p className="text-sm font-medium text-red-600 bg-red-50 p-2 rounded-lg">{errors.code}</p>
                  )}
                  <p className="text-sm text-slate-500 bg-slate-50 p-2 rounded-lg">
                    💡 Ders kodu sadece büyük harf ve rakam içermelidir (örn: CS101).
                  </p>
                </div>

                <div ref={(el) => { errorRefs.current.department = el; }} className="space-y-3">
                  <Label htmlFor="department" className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    Bölüm / Program <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <Select
                    id="department"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    disabled={loadingDepartments}
                    className={`h-14 text-lg border-2 transition-all ${
                      errors.department 
                        ? "border-[#bf1e1d] focus:border-[#bf1e1d] focus:ring-[#bf1e1d]/20" 
                        : "border-gray-300 focus:border-[#0a294e] focus:ring-[#0a294e]/20"
                    } rounded-xl shadow-sm`}
                  >
                    <option value="">Bölüm Seçin</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </Select>
                  {loadingDepartments && (
                    <p className="text-sm text-slate-500">Bölümler yükleniyor...</p>
                  )}
                  {errors.department && (
                    <p className="text-sm font-medium text-red-600 bg-red-50 p-2 rounded-lg">{errors.department}</p>
                  )}
                </div>

                <div ref={(el) => { errorRefs.current.semester = el; }} className="space-y-3">
                  <Label htmlFor="semester" className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    Dönem <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <Select
                    id="semester"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className={`h-14 text-lg border-2 transition-all ${
                      errors.semester 
                        ? "border-[#bf1e1d] focus:border-[#bf1e1d] focus:ring-[#bf1e1d]/20" 
                        : "border-gray-300 focus:border-[#0a294e] focus:ring-[#0a294e]/20"
                    } rounded-xl shadow-sm`}
                  >
                    <option value="">Dönem Seçin</option>
                    {semestersOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Select>
                  {errors.semester && (
                    <p className="text-sm font-medium text-red-600 bg-red-50 p-2 rounded-lg">{errors.semester}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-lg font-semibold text-slate-700">
                    Ders Açıklaması <span className="text-slate-400 font-normal">(İsteğe Bağlı)</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Dersin içeriği, hedefleri vb. hakkında kısa bir açıklama..."
                    rows={5}
                    className="text-lg border-2 border-gray-300 focus:border-[#0a294e] focus:ring-[#0a294e]/20 rounded-xl shadow-sm resize-none"
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Section 2: Learning Outcomes (ÖÇ) */}
          <Card className="rounded-2xl shadow-lg border-2 border-purple-100 bg-white hover:shadow-xl transition-shadow duration-300">
            <CardHeader
              className="cursor-pointer flex flex-row items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl p-6 hover:from-purple-100 hover:to-pink-100 transition-colors"
              onClick={() => toggleSection("learningOutcomes")}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-500 rounded-lg shadow-md">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-800">Öğrenme Çıktıları (ÖÇ)</CardTitle>
              </div>
              {expandedSections.learningOutcomes ? (
                <ChevronUp className="h-6 w-6 text-purple-600" />
              ) : (
                <ChevronDown className="h-6 w-6 text-purple-600" />
              )}
            </CardHeader>
            {expandedSections.learningOutcomes && (
              <CardContent className="p-6 pt-4 space-y-6">
                <div ref={(el) => { errorRefs.current.learningOutcomes = el; }}>
                  <OutcomeEditor
                    outcomes={learningOutcomes}
                    onChange={setLearningOutcomes}
                    departmentId={departmentId}
                    errors={errors}
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Section 3: Exam Settings */}
          <Card className="rounded-2xl shadow-lg border-2 border-orange-100 bg-white hover:shadow-xl transition-shadow duration-300">
            <CardHeader
              className="cursor-pointer flex flex-row items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-2xl p-6 hover:from-orange-100 hover:to-amber-100 transition-colors"
              onClick={() => toggleSection("examSettings")}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-500 rounded-lg shadow-md">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-800">Sınav Ayarları</CardTitle>
              </div>
              {expandedSections.examSettings ? (
                <ChevronUp className="h-6 w-6 text-orange-600" />
              ) : (
                <ChevronDown className="h-6 w-6 text-orange-600" />
              )}
            </CardHeader>
            {expandedSections.examSettings && (
              <CardContent className="p-6 pt-4 space-y-6">
                <div ref={(el) => { errorRefs.current.midtermExamCode = el; }}>
                  <ExamSettingsComponent
                    midterm={midtermExam}
                    final={finalExam}
                    onMidtermChange={setMidtermExam}
                    onFinalChange={setFinalExam}
                    errors={errors}
                  />
                </div>
                {errors.examCodeMatch && (
                  <p className="text-sm font-medium text-destructive mt-2">
                    {errors.examCodeMatch}
                  </p>
                )}
              </CardContent>
            )}
          </Card>

          {/* Section 4: Student List (Word/TXT Import) */}
          <Card className="rounded-2xl shadow-lg border-2 border-cyan-100 bg-white hover:shadow-xl transition-shadow duration-300">
            <CardHeader
              className="cursor-pointer flex flex-row items-center justify-between bg-gradient-to-r from-cyan-50 to-blue-50 rounded-t-2xl p-6 hover:from-cyan-100 hover:to-blue-100 transition-colors"
              onClick={() => toggleSection("studentImport")}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-cyan-500 rounded-lg shadow-md">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-800">Öğrenci Listesi</CardTitle>
              </div>
              {expandedSections.studentImport ? (
                <ChevronUp className="h-6 w-6 text-cyan-600" />
              ) : (
                <ChevronDown className="h-6 w-6 text-cyan-600" />
              )}
            </CardHeader>
            {expandedSections.studentImport && (
              <CardContent className="p-6 pt-4 space-y-6">
                <div ref={(el) => { errorRefs.current.students = el; }}>
                  <StudentImporter
                    students={students}
                    onChange={setStudents}
                    errors={errors}
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Spacer for fixed button */}
          <div className="h-24"></div>

          {/* Fixed Submit Button */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t-2 border-gray-200 p-6 shadow-2xl z-10">
            <div className="max-w-6xl mx-auto flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="h-14 px-8 text-lg border-2 border-gray-300 hover:bg-gray-50"
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="h-14 px-12 text-xl font-bold bg-[#0a294e] hover:bg-[#0a294e]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-5 w-5" />
                    Dersi Oluştur
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
