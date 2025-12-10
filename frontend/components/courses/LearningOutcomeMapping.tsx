"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Save, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { programOutcomeApi, type ProgramOutcome } from "@/lib/api/programOutcomeApi";
import { courseApi, type Course } from "@/lib/api/courseApi";

interface LearningOutcomeMappingProps {
  courseId: string;
  course: Course;
  departmentId: string;
  onUpdate: () => void;
}

export function LearningOutcomeMapping({
  courseId,
  course,
  departmentId,
  onUpdate,
}: LearningOutcomeMappingProps) {
  const [programOutcomes, setProgramOutcomes] = useState<ProgramOutcome[]>([]);
  const [learningOutcomes, setLearningOutcomes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingPOs, setLoadingPOs] = useState(true);

  useEffect(() => {
    loadProgramOutcomes();
    loadLearningOutcomes();
  }, [departmentId, course]);

  const loadProgramOutcomes = async () => {
    try {
      setLoadingPOs(true);
      const data = await programOutcomeApi.getByDepartment(departmentId);
      setProgramOutcomes(data || []);
    } catch (error: any) {
      toast.error("Program çıktıları yüklenemedi");
      console.error(error);
    } finally {
      setLoadingPOs(false);
    }
  };

  const loadLearningOutcomes = () => {
    if (course.learningOutcomes && Array.isArray(course.learningOutcomes)) {
      setLearningOutcomes(
        course.learningOutcomes.map((lo: any) => ({
          code: lo.code || "",
          description: lo.description || "",
          programOutcomes: lo.programOutcomes || lo.relatedProgramOutcomes || [],
        }))
      );
    }
  };

  const toggleProgramOutcome = (loIndex: number, poCode: string) => {
    const updated = [...learningOutcomes];
    const currentPOs = updated[loIndex].programOutcomes || [];
    updated[loIndex].programOutcomes = currentPOs.includes(poCode)
      ? currentPOs.filter((code: string) => code !== poCode)
      : [...currentPOs, poCode];
    setLearningOutcomes(updated);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        learningOutcomes: learningOutcomes.map((lo) => ({
          code: lo.code.trim(),
          description: lo.description.trim(),
          programOutcomes: lo.programOutcomes || [],
        })),
      };

      await courseApi.updateCourse(courseId, payload);
      toast.success("ÖÇ → PÇ eşlemesi başarıyla kaydedildi");
      onUpdate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Eşleme kaydedilemedi");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingPOs) {
    return (
      <Card className="border-2 border-[#0a294e]/20">
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0a294e] mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Program çıktıları yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  if (programOutcomes.length === 0) {
    return (
      <Card className="border-2 border-yellow-200">
        <CardContent className="p-8 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Bu bölüm için henüz program çıktısı tanımlanmamış.
          </p>
          <Button
            onClick={() => window.open("/dashboard/program-outcomes", "_blank")}
            variant="outline"
            className="h-11"
          >
            Program Çıktıları Yönetimi
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (learningOutcomes.length === 0) {
    return (
      <Card className="border-2 border-yellow-200">
        <CardContent className="p-8 text-center">
          <p className="text-lg text-muted-foreground">
            Bu ders için henüz öğrenme çıktısı tanımlanmamış. Lütfen dersi düzenleyip öğrenme çıktıları ekleyin.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-[#0a294e]/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-[#0a294e] flex items-center gap-2">
                <Target className="h-6 w-6" />
                Öğrenme Çıktısı → Program Çıktısı Eşlemesi
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Her öğrenme çıktısı için hangi program çıktılarına katkıda bulunduğunu seçin
              </CardDescription>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="h-11 px-6 bg-[#0a294e] hover:bg-[#0a294e]/90 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Değişiklikleri Kaydet
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {learningOutcomes.map((lo, loIndex) => {
          const selectedPOs = lo.programOutcomes || [];
          return (
            <Card key={loIndex} className="border-2 border-purple-200 hover:border-purple-300 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="bg-[#0a294e] text-white text-lg px-4 py-1">
                    {lo.code}
                  </Badge>
                  <CardTitle className="text-xl">{lo.description}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Bu öğrenme çıktısı hangi program çıktılarına katkıda bulunur?
                </p>
                <div className="flex flex-wrap gap-2">
                  {programOutcomes.map((po) => {
                    const isSelected = selectedPOs.includes(po.code);
                    return (
                      <Badge
                        key={po.code}
                        variant={isSelected ? "default" : "outline"}
                        className={`cursor-pointer text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                          isSelected
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md"
                            : "border-2 border-slate-300 text-slate-700 hover:bg-green-50 hover:border-green-400"
                        }`}
                        onClick={() => toggleProgramOutcome(loIndex, po.code)}
                      >
                        <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isSelected ? "bg-white border-white" : "border-slate-400"
                        }`}>
                          {isSelected && <span className="text-green-600 text-xs">✓</span>}
                        </span>
                        {po.code} - {po.description}
                      </Badge>
                    );
                  })}
                </div>
                {selectedPOs.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>Seçilen PÇ'ler:</strong> {selectedPOs.join(", ")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

