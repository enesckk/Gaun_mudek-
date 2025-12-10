"use client";

import { useState } from "react";
import { Edit, Users, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Score } from "@/lib/api/scoreApi";
import { ScoreEditDialog } from "./ScoreEditDialog";

interface ScoreTableProps {
  scores: Score[];
  onUpdate?: () => void;
}

export function ScoreTable({ scores, onUpdate }: ScoreTableProps) {
  const [groupBy, setGroupBy] = useState<"student" | "question">("student");
  const [editingScore, setEditingScore] = useState<Score | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const getStudentInfo = (score: Score) => {
    if (typeof score.studentId === "string") {
      return { id: score.studentId, number: "Unknown", name: "Unknown" };
    }
    return {
      id: score.studentId._id,
      number: score.studentId.studentNumber,
      name: score.studentId.name,
    };
  };

  const getQuestionInfo = (score: Score) => {
    if (typeof score.questionId === "string") {
      return { id: score.questionId, number: 0, maxScore: 0 };
    }
    return {
      id: score.questionId._id,
      number: score.questionId.number,
      maxScore: score.questionId.maxScore,
    };
  };

  const getLearningOutcomeCode = (score: Score): string => {
    if (typeof score.questionId === "string") return "-";
    const lo = score.questionId.mappedLearningOutcome;
    if (!lo || typeof lo === "string") return "-";
    return lo.code || "-";
  };

  const handleEditClick = (score: Score) => {
    setEditingScore(score);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setEditingScore(null);
    onUpdate?.();
  };

  if (scores.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No scores found for this exam.
      </div>
    );
  }

  // Group by Student
  if (groupBy === "student") {
    const groupedByStudent = scores.reduce((acc, score) => {
      const student = getStudentInfo(score);
      if (!acc[student.id]) {
        acc[student.id] = [];
      }
      acc[student.id].push(score);
      return acc;
    }, {} as Record<string, Score[]>);

    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Scores by Student</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGroupBy("question")}
          >
            <List className="mr-2 h-4 w-4" />
            Group by Question
          </Button>
        </div>

        <div className="space-y-4">
          {Object.entries(groupedByStudent).map(([studentId, studentScores]) => {
            const student = getStudentInfo(studentScores[0]);
            return (
              <Card key={studentId} className="rounded-xl shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {student.name} ({student.number})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question Number</TableHead>
                        <TableHead>Score / Max Score</TableHead>
                        <TableHead>Learning Outcome</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentScores.map((score, index) => {
                        const question = getQuestionInfo(score);
                        const loCode = getLearningOutcomeCode(score);
                        return (
                          <TableRow
                            key={score._id}
                            className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}
                          >
                            <TableCell className="font-medium">
                              {question.number}
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{score.scoreValue}</span>
                              <span className="text-muted-foreground"> / {question.maxScore}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{loCode}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditClick(score)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <ScoreEditDialog
          score={editingScore}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      </>
    );
  }

  // Group by Question
  const groupedByQuestion = scores.reduce((acc, score) => {
    const question = getQuestionInfo(score);
    if (!acc[question.id]) {
      acc[question.id] = [];
    }
    acc[question.id].push(score);
    return acc;
  }, {} as Record<string, Score[]>);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Scores by Question</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setGroupBy("student")}
        >
          <Users className="mr-2 h-4 w-4" />
          Group by Student
        </Button>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedByQuestion).map(([questionId, questionScores]) => {
          const question = getQuestionInfo(questionScores[0]);
          const loCode = getLearningOutcomeCode(questionScores[0]);
          return (
            <Card key={questionId} className="rounded-xl shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Question {question.number} (Max: {question.maxScore})
                  {loCode !== "-" && (
                    <Badge variant="secondary" className="ml-2">
                      {loCode}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Number</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Score / Max Score</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questionScores.map((score, index) => {
                      const student = getStudentInfo(score);
                      return (
                        <TableRow
                          key={score._id}
                          className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}
                        >
                          <TableCell className="font-medium">
                            {student.number}
                          </TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>
                            <span className="font-medium">{score.scoreValue}</span>
                            <span className="text-muted-foreground"> / {question.maxScore}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditClick(score)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ScoreEditDialog
        score={editingScore}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}

