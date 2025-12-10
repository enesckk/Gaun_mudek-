"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, GraduationCap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { programOutcomeApi, type ProgramOutcome } from "@/lib/api/programOutcomeApi";
import { cn } from "@/lib/utils";

export interface LearningOutcome {
  code: string;
  description: string;
  programOutcomes?: string[]; // PÇ codes (e.g., ["PÇ1", "PÇ2"])
}

interface OutcomeEditorProps {
  outcomes: LearningOutcome[];
  onChange: (outcomes: LearningOutcome[]) => void;
  departmentId?: string; // Department ID to fetch PÇ list
  errors?: Record<string, string>;
  disabled?: boolean;
}

export function OutcomeEditor({
  outcomes,
  onChange,
  departmentId,
  errors = {},
  disabled = false,
}: OutcomeEditorProps) {
  const [programOutcomes, setProgramOutcomes] = useState<ProgramOutcome[]>([]);
  const [loadingPOs, setLoadingPOs] = useState(false);

  // Load program outcomes when departmentId changes
  useEffect(() => {
    if (departmentId) {
      loadProgramOutcomes();
    } else {
      setProgramOutcomes([]);
    }
  }, [departmentId]);

  const loadProgramOutcomes = async () => {
    if (!departmentId) return;
    try {
      setLoadingPOs(true);
      const data = await programOutcomeApi.getByDepartment(departmentId);
      setProgramOutcomes(data || []);
    } catch (error: any) {
      console.error("Program çıktıları yüklenirken hata:", error);
      setProgramOutcomes([]);
    } finally {
      setLoadingPOs(false);
    }
  };

  // Auto-suggest ÖÇ codes: ÖÇ1, ÖÇ2, ÖÇ3...
  const getSuggestedCode = (index: number): string => {
    return `ÖÇ${index + 1}`;
  };

  const addOutcome = () => {
    const newIndex = outcomes.length;
    const suggestedCode = getSuggestedCode(newIndex);
    onChange([...outcomes, { code: suggestedCode, description: "", programOutcomes: [] }]);
  };

  const removeOutcome = (index: number) => {
    if (outcomes.length > 1) {
      const updated = outcomes.filter((_, i) => i !== index);
      // Re-number remaining outcomes if they follow the pattern
      const renumbered = updated.map((outcome, idx) => {
        // If code is empty or matches the pattern ÖÇ{N}, suggest new code
        if (!outcome.code || /^ÖÇ\d+$/.test(outcome.code)) {
          return { ...outcome, code: getSuggestedCode(idx) };
        }
        return outcome;
      });
      onChange(renumbered);
    }
  };

  const updateOutcome = (
    index: number,
    field: "code" | "description" | "programOutcomes",
    value: string | string[]
  ) => {
    const updated = [...outcomes];
    updated[index][field] = value as any;
    onChange(updated);
  };

  const toggleProgramOutcome = (outcomeIndex: number, poCode: string) => {
    const outcome = outcomes[outcomeIndex];
    const currentPOs = outcome.programOutcomes || [];
    const updatedPOs = currentPOs.includes(poCode)
      ? currentPOs.filter((code) => code !== poCode)
      : [...currentPOs, poCode];
    updateOutcome(outcomeIndex, "programOutcomes", updatedPOs);
  };

  // Auto-fill code on focus if empty
  const handleCodeFocus = (index: number) => {
    if (!outcomes[index].code.trim()) {
      const suggestedCode = getSuggestedCode(index);
      updateOutcome(index, "code", suggestedCode);
    }
  };

  return (
    <div className="space-y-4">
      {errors.learningOutcomes && (
        <p className="text-base text-destructive font-medium">
          {errors.learningOutcomes}
        </p>
      )}

      <div className="space-y-6">
        {outcomes.map((outcome, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 p-6 border-2 border-purple-200 rounded-2xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 shadow-md"
          >
            {/* ÖÇ Kodu ve Açıklama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor={`outcome-code-${index}`}
                  className="text-lg font-semibold text-slate-700"
                >
                  ÖÇ Kodu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`outcome-code-${index}`}
                  value={outcome.code}
                  onChange={(e) => updateOutcome(index, "code", e.target.value)}
                  onFocus={() => handleCodeFocus(index)}
                  placeholder={`Örn: ${getSuggestedCode(index)}`}
                  disabled={disabled}
                  className={cn(
                    "h-14 text-lg border-2 rounded-xl",
                    errors[`lo_${index}_code`] 
                      ? "border-red-400 focus:border-red-500" 
                      : "border-slate-200 focus:border-purple-500"
                  )}
                />
                {errors[`lo_${index}_code`] && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                    {errors[`lo_${index}_code`]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor={`outcome-desc-${index}`}
                  className="text-lg font-semibold text-slate-700"
                >
                  Açıklama <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`outcome-desc-${index}`}
                  value={outcome.description}
                  onChange={(e) =>
                    updateOutcome(index, "description", e.target.value)
                  }
                  placeholder="Örn: Algoritma analizini anlama"
                  disabled={disabled}
                  className={cn(
                    "h-14 text-lg border-2 rounded-xl",
                    errors[`lo_${index}_description`]
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-200 focus:border-purple-500"
                  )}
                />
                {errors[`lo_${index}_description`] && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                    {errors[`lo_${index}_description`]}
                  </p>
                )}
              </div>
            </div>

            {/* Program Çıktıları (PÇ) Seçimi */}
            {departmentId && (
              <div className="space-y-3 pt-4 border-t border-purple-200">
                <div className="flex items-start gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-base font-semibold text-slate-700">
                      Bu ÖÇ hangi Program Çıktılarına (PÇ) katkıda bulunur?
                      <span className="text-slate-400 font-normal ml-1">(İsteğe bağlı)</span>
                    </Label>
                    {loadingPOs ? (
                      <p className="text-sm text-slate-500 mt-2">PÇ listesi yükleniyor...</p>
                    ) : programOutcomes.length === 0 ? (
                      <p className="text-sm text-slate-500 mt-2">
                        Bu bölüm için henüz program çıktısı tanımlanmamış.
                      </p>
                    ) : (
                      <div className="mt-2 p-3 bg-[#0a294e]/5 rounded-lg border border-[#0a294e]/10">
                        <div className="flex items-start gap-2 text-sm text-[#0a294e]">
                          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold mb-1">MÜDEK Mantığı:</p>
                            <p>Her Öğrenme Çıktısı (ÖÇ), bir veya daha fazla Program Çıktısına (PÇ) katkıda bulunur. Sorular sadece ÖÇ'ye eşlenir, PÇ otomatik olarak ÖÇ'den türetilir.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {programOutcomes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {programOutcomes.map((po) => {
                      const isSelected = (outcome.programOutcomes || []).includes(po.code);
                      return (
                        <Badge
                          key={po.code}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                            isSelected
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md"
                              : "border-2 border-slate-300 text-slate-700 hover:bg-green-50 hover:border-green-400"
                          }`}
                          onClick={() => !disabled && toggleProgramOutcome(index, po.code)}
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
                )}
                {(outcome.programOutcomes || []).length > 0 && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                    💡 {outcome.programOutcomes?.length} program çıktısı seçildi: {outcome.programOutcomes?.join(", ")}
                  </p>
                )}
              </div>
            )}

            {/* Sil Butonu */}
            {outcomes.length > 1 && (
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOutcome(index)}
                  disabled={disabled}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Bu ÖÇ'yi Sil
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={addOutcome}
        disabled={disabled}
        className="w-full h-14 text-lg font-semibold"
      >
        <Plus className="h-6 w-6 mr-2" />
        ÖÇ Ekle
      </Button>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

