"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ExamSettings {
  examCode: string;
  questionCount: number;
  maxScorePerQuestion: number;
}

interface ExamSettingsProps {
  midterm: ExamSettings;
  final: ExamSettings;
  onMidtermChange: (settings: ExamSettings) => void;
  onFinalChange: (settings: ExamSettings) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export function ExamSettingsComponent({
  midterm,
  final,
  onMidtermChange,
  onFinalChange,
  errors = {},
  disabled = false,
}: ExamSettingsProps) {
  const updateMidterm = (field: keyof ExamSettings, value: string | number) => {
    onMidtermChange({ ...midterm, [field]: value });
  };

  const updateFinal = (field: keyof ExamSettings, value: string | number) => {
    onFinalChange({ ...final, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Midterm Card */}
      <Card className="rounded-xl shadow-sm border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Vize Sınavı</CardTitle>
          <CardDescription className="text-base">
            Vize sınavı ayarlarını girin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="midterm-code" className="text-lg font-semibold">
              Sınav Kodu (2 haneli) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="midterm-code"
              type="text"
              value={midterm.examCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 2);
                updateMidterm("examCode", value);
              }}
              placeholder="01"
              disabled={disabled}
              className={cn(
                "h-14 text-lg text-center font-mono",
                errors.midtermExamCode ? "border-destructive border-2" : ""
              )}
            />
            {errors.midtermExamCode && (
              <p className="text-sm text-destructive">{errors.midtermExamCode}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="midterm-questions" className="text-lg font-semibold">
              Soru Sayısı <span className="text-destructive">*</span>
            </Label>
            <Input
              id="midterm-questions"
              type="number"
              min="1"
              value={midterm.questionCount || ""}
              onChange={(e) =>
                updateMidterm("questionCount", parseInt(e.target.value) || 0)
              }
              placeholder="10"
              disabled={disabled}
              className={cn(
                "h-14 text-lg",
                errors.midtermQuestionCount ? "border-destructive border-2" : ""
              )}
            />
            {errors.midtermQuestionCount && (
              <p className="text-sm text-destructive">
                {errors.midtermQuestionCount}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="midterm-max-score" className="text-lg font-semibold">
              Soru Başına Maksimum Puan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="midterm-max-score"
              type="number"
              min="0"
              step="0.1"
              value={midterm.maxScorePerQuestion || ""}
              onChange={(e) =>
                updateMidterm(
                  "maxScorePerQuestion",
                  parseFloat(e.target.value) || 0
                )
              }
              placeholder="10"
              disabled={disabled}
              className={cn(
                "h-14 text-lg",
                errors.midtermMaxScore ? "border-destructive border-2" : ""
              )}
            />
            {errors.midtermMaxScore && (
              <p className="text-sm text-destructive">{errors.midtermMaxScore}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Final Card */}
      <Card className="rounded-xl shadow-sm border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Final Sınavı</CardTitle>
          <CardDescription className="text-base">
            Final sınavı ayarlarını girin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="final-code" className="text-lg font-semibold">
              Sınav Kodu (2 haneli) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="final-code"
              type="text"
              value={final.examCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 2);
                updateFinal("examCode", value);
              }}
              placeholder="02"
              disabled={disabled}
              className={cn(
                "h-14 text-lg text-center font-mono",
                errors.finalExamCode ? "border-destructive border-2" : ""
              )}
            />
            {errors.finalExamCode && (
              <p className="text-sm text-destructive">{errors.finalExamCode}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="final-questions" className="text-lg font-semibold">
              Soru Sayısı <span className="text-destructive">*</span>
            </Label>
            <Input
              id="final-questions"
              type="number"
              min="1"
              value={final.questionCount || ""}
              onChange={(e) =>
                updateFinal("questionCount", parseInt(e.target.value) || 0)
              }
              placeholder="10"
              disabled={disabled}
              className={cn(
                "h-14 text-lg",
                errors.finalQuestionCount ? "border-destructive border-2" : ""
              )}
            />
            {errors.finalQuestionCount && (
              <p className="text-sm text-destructive">{errors.finalQuestionCount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="final-max-score" className="text-lg font-semibold">
              Soru Başına Maksimum Puan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="final-max-score"
              type="number"
              min="0"
              step="0.1"
              value={final.maxScorePerQuestion || ""}
              onChange={(e) =>
                updateFinal(
                  "maxScorePerQuestion",
                  parseFloat(e.target.value) || 0
                )
              }
              placeholder="10"
              disabled={disabled}
              className={cn(
                "h-14 text-lg",
                errors.finalMaxScore ? "border-destructive border-2" : ""
              )}
            />
            {errors.finalMaxScore && (
              <p className="text-sm text-destructive">{errors.finalMaxScore}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

