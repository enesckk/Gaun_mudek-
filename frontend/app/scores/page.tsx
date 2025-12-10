"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreTable } from "@/components/scores/ScoreTable";
import { examApi, type Exam } from "@/lib/api/examApi";
import { scoreApi, type Score } from "@/lib/api/scoreApi";

export default function ScoresPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingExams, setIsLoadingExams] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchScores();
    } else {
      setScores([]);
    }
  }, [selectedExamId]);

  const fetchExams = async () => {
    try {
      setIsLoadingExams(true);
      const data = await examApi.getAll();
      setExams(data);
    } catch (error: any) {
      toast.error("Failed to load exams");
      console.error(error);
    } finally {
      setIsLoadingExams(false);
    }
  };

  const fetchScores = async () => {
    try {
      setIsLoading(true);
      const data = await scoreApi.getByExam(selectedExamId);
      setScores(data);
    } catch (error: any) {
      toast.error("Failed to load scores");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedExam = exams.find((e) => e._id === selectedExamId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Score Management</h2>
          <p className="text-muted-foreground">
            View and manage exam scores for students
          </p>
        </div>
        <Button onClick={() => router.push("/scores/upload")}>
          <Upload className="mr-2 h-4 w-4" />
          AI Bulk Score Upload
        </Button>
      </div>

      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Select Exam</CardTitle>
          <CardDescription>
            Choose an exam to view and manage scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            disabled={isLoadingExams}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select an exam...</option>
            {exams.map((exam) => (
              <option key={exam._id} value={exam._id}>
                {exam.title} ({exam.type})
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedExamId && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle>
              Scores for: {selectedExam?.title || "Loading..."}
            </CardTitle>
            <CardDescription>
              {selectedExam && `Exam Type: ${selectedExam.type}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading scores...
              </div>
            ) : (
              <ScoreTable scores={scores} onUpdate={fetchScores} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

