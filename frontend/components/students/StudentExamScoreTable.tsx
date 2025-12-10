"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Score } from "@/lib/api/scoreApi";

interface StudentExamScoreTableProps {
  scores: Score[];
}

export function StudentExamScoreTable({ scores }: StudentExamScoreTableProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const formatType = (type: string) => {
    const typeMap: Record<string, string> = {
      midterm: "Midterm",
      final: "Final",
      makeup: "Makeup",
    };
    return typeMap[type] || type;
  };

  const getExamTitle = (score: Score): string => {
    if (typeof score.examId === "string") return "Unknown Exam";
    return score.examId.title || "Unknown Exam";
  };

  const getExamType = (score: Score): string => {
    if (typeof score.examId === "string") return "-";
    return score.examId.type || "-";
  };

  const getQuestionNumber = (score: Score): number => {
    if (typeof score.questionId === "string") return 0;
    return score.questionId.number || 0;
  };

  const getMaxScore = (score: Score): number => {
    if (typeof score.questionId === "string") return 0;
    return score.questionId.maxScore || 0;
  };

  const getLearningOutcomeCode = (score: Score): string => {
    if (typeof score.questionId === "string") return "-";
    const lo = score.questionId.mappedLearningOutcome;
    if (typeof lo === "string") return "-";
    if (!lo) return "-";
    return lo.code || "-";
  };

  const getExamId = (score: Score): string => {
    if (typeof score.examId === "string") return score.examId;
    return score.examId._id;
  };

  // Group scores by exam
  const groupedScores = scores.reduce((acc, score) => {
    const examId = getExamId(score);
    if (!acc[examId]) {
      acc[examId] = [];
    }
    acc[examId].push(score);
    return acc;
  }, {} as Record<string, Score[]>);

  if (scores.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No scores found for this student.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedScores).map(([examId, examScores]) => {
        const firstScore = examScores[0];
        const examTitle = getExamTitle(firstScore);
        const examType = getExamType(firstScore);
        const examDate = firstScore.createdAt ? formatDate(firstScore.createdAt) : "-";

        return (
          <div key={examId} className="rounded-md border">
            <div className="bg-muted/50 px-4 py-2 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{examTitle}</span>
                  <Badge variant="outline">{formatType(examType)}</Badge>
                </div>
                <span className="text-sm text-muted-foreground">{examDate}</span>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question Number</TableHead>
                  <TableHead>Score / Max Score</TableHead>
                  <TableHead>Learning Outcome Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examScores.map((score, index) => {
                  const questionNumber = getQuestionNumber(score);
                  const maxScore = getMaxScore(score);
                  const loCode = getLearningOutcomeCode(score);

                  return (
                    <TableRow
                      key={score._id}
                      className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}
                    >
                      <TableCell className="font-medium">{questionNumber}</TableCell>
                      <TableCell>
                        <span className="font-medium">{score.scoreValue}</span>
                        <span className="text-muted-foreground"> / {maxScore}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{loCode}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
}

