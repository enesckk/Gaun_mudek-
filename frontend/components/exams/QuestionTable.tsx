"use client";

import { Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { type Question } from "@/lib/api/questionApi";
import { DeleteQuestionDialog } from "./DeleteQuestionDialog";
import { useState } from "react";

interface QuestionTableProps {
  questions: Question[];
  onDelete?: () => void;
  onEdit?: (question: Question) => void;
}

export function QuestionTable({ questions, onDelete, onEdit }: QuestionTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const handleDeleteClick = (question: Question) => {
    setSelectedQuestion(question);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setSelectedQuestion(null);
    onDelete?.();
  };

  const getLearningOutcomeCodes = (question: Question): string[] => {
    // New format: mappedLearningOutcomes is an array
    if (Array.isArray(question.mappedLearningOutcomes)) {
      return question.mappedLearningOutcomes;
    }
    // Backward compatibility: if old format exists, convert to array
    if ((question as any).mappedLearningOutcome) {
      const lo = (question as any).mappedLearningOutcome;
      if (typeof lo === "string") {
        return [lo];
      }
      if (lo && typeof lo === "object" && lo.code) {
        return [lo.code];
      }
    }
    return [];
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-600 bg-slate-50 rounded-lg border-2 border-dashed">
        <p className="text-lg font-medium mb-2">Henüz soru eklenmemiş</p>
        <p className="text-sm text-slate-500">Bu sınava soru eklemek için "Soru Ekle" butonuna tıklayın</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-base font-semibold">Soru No</TableHead>
              <TableHead className="text-base font-semibold">Maksimum Puan</TableHead>
              <TableHead className="text-base font-semibold">Öğrenme Çıktıları (ÖÇ)</TableHead>
              <TableHead className="text-right text-base font-semibold">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question, index) => (
              <TableRow
                key={question._id}
                className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}
              >
                <TableCell className="font-medium">{question.number}</TableCell>
                <TableCell>{question.maxScore}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {getLearningOutcomeCodes(question).length > 0 ? (
                      getLearningOutcomeCodes(question).map((code, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-md bg-[#0a294e]/10 text-[#0a294e] text-sm font-medium"
                        >
                          {code}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">ÖÇ seçilmemiş</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteClick(question)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedQuestion && (
        <DeleteQuestionDialog
          questionId={selectedQuestion._id}
          questionNumber={selectedQuestion.number}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}

