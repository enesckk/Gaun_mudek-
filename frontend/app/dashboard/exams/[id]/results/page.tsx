"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { examApi, type ExamAnalysisResponse } from "@/lib/api/examApi";
import { Bar, BarChart, CartesianGrid, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Download, Loader2, ArrowLeft } from "lucide-react";

type QuestionRow = ExamAnalysisResponse["questionAnalysis"][number];
type OutcomeRow = ExamAnalysisResponse["learningOutcomeAnalysis"][number];
type ProgramRow = ExamAnalysisResponse["programOutcomeAnalysis"][number];

interface StudentResult {
  _id: string;
  studentNumber: string;
  questionScores: Array<{
    questionNumber: number;
    score: number;
    learningOutcomeCode: string | null;
  }>;
  outcomePerformance: Record<string, number>;
  programOutcomePerformance: Record<string, number>;
  createdAt: string;
}

export default function ExamResultsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [analysis, setAnalysis] = useState<ExamAnalysisResponse | null>(null);
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (examId) {
      load();
      loadResults();
    }
  }, [examId]);

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await examApi.getAnalysis(examId);
      setAnalysis(data);
    } catch (error: any) {
      toast.error("Sonuçlar yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const loadResults = async () => {
    try {
      const results = await examApi.getResults(examId);
      setStudentResults(results);
    } catch (error: any) {
      console.error("Öğrenci sonuçları yüklenemedi:", error);
    }
  };

  const questionData = useMemo<QuestionRow[]>(() => analysis?.questionAnalysis || [], [analysis]);
  const outcomeData = useMemo<OutcomeRow[]>(() => analysis?.learningOutcomeAnalysis || [], [analysis]);
  const programData = useMemo<ProgramRow[]>(() => analysis?.programOutcomeAnalysis || [], [analysis]);

  const handleExport = () => window.print();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Yükleniyor...
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Sınav Sonuçları</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Soru → ÖÇ → PÇ başarı analizleri</p>
          </div>
        </div>
        <Button 
          onClick={handleExport} 
          className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-5 text-sm sm:text-base"
        >
          <Download className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">PDF oluştur</span>
          <span className="sm:hidden">PDF</span>
        </Button>
      </div>

      {/* Öğrenci Sonuçları Tablosu - En üstte */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Öğrenci Sonuçları</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {studentResults.length} öğrencinin soru bazlı puanları
          </p>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          {studentResults.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm">
              Henüz sonuç kaydı yok.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 z-20 bg-slate-100 dark:bg-slate-800 min-w-[100px] sm:min-w-[120px]">
                      <span className="text-xs sm:text-sm">Öğrenci No</span>
                    </TableHead>
                    {questionData.map((q) => (
                      <TableHead key={q.questionNumber} className="text-center min-w-[70px] sm:min-w-[80px]">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-xs sm:text-sm">Soru {q.questionNumber}</span>
                          {q.learningOutcomeCode && (
                            <Badge variant="outline" className="text-[10px] sm:text-xs">
                              {q.learningOutcomeCode}
                            </Badge>
                          )}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-center min-w-[80px] sm:min-w-[100px]">
                      <span className="text-xs sm:text-sm">Toplam</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentResults.map((result) => {
                    const totalScore = result.questionScores.reduce(
                      (sum, qs) => sum + (qs.score || 0),
                      0
                    );
                    const maxTotal = questionData.length * (questionData[0]?.maxScore || 0);
                    const percentage = maxTotal > 0 ? Math.round((totalScore / maxTotal) * 100) : 0;

                    return (
                      <TableRow key={result._id}>
                        <TableCell className="font-medium sticky left-0 z-20 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm">
                          {result.studentNumber}
                        </TableCell>
                        {questionData.map((q) => {
                          const qs = result.questionScores.find(
                            (s) => s.questionNumber === q.questionNumber
                          );
                          const score = qs?.score || 0;
                          const maxScore = q.maxScore || 0;
                          const qPercentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

                          return (
                            <TableCell key={q.questionNumber} className="text-center p-2 sm:p-4">
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-semibold text-xs sm:text-sm">{score}</span>
                                <span className="text-[10px] sm:text-xs text-muted-foreground">/{maxScore}</span>
                                <Badge
                                  variant={
                                    qPercentage >= 60
                                      ? "default"
                                      : qPercentage >= 40
                                      ? "secondary"
                                      : "destructive"
                                  }
                                  className="text-[10px] sm:text-xs"
                                >
                                  %{qPercentage}
                                </Badge>
                              </div>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center font-semibold p-2 sm:p-4">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs sm:text-sm">{totalScore}</span>
                            <span className="text-[10px] sm:text-xs text-muted-foreground">/{maxTotal}</span>
                            <Badge
                              variant={
                                percentage >= 60
                                  ? "default"
                                  : percentage >= 40
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="text-[10px] sm:text-xs"
                            >
                              %{percentage}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Soru → ÖÇ Tablosu</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6 overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full border text-xs sm:text-sm min-w-[500px]">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="p-2 sm:p-3 border text-left sm:text-center">Soru</th>
                <th className="p-2 sm:p-3 border text-left sm:text-center">ÖÇ</th>
                <th className="p-2 sm:p-3 border text-left sm:text-center">Ortalama</th>
                <th className="p-2 sm:p-3 border text-left sm:text-center">Başarı %</th>
                <th className="p-2 sm:p-3 border text-left sm:text-center">Cevap Veren</th>
              </tr>
            </thead>
            <tbody>
              {questionData.map((q) => (
                <tr key={q.questionNumber} className="text-center">
                  <td className="border p-2 sm:p-3">{q.questionNumber}</td>
                  <td className="border p-2 sm:p-3">{q.learningOutcomeCode || "-"}</td>
                  <td className="border p-2 sm:p-3">{q.averageScore}</td>
                  <td className="border p-2 sm:p-3">{q.successRate}%</td>
                  <td className="border p-2 sm:p-3">{q.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">ÖÇ Başarı Grafiği</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6 h-64 sm:h-72">
          {outcomeData.length === 0 ? (
            <p className="text-muted-foreground">ÖÇ verisi yok.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outcomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="code" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="success" name="Başarı %" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">PÇ Radar Grafiği</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6 h-64 sm:h-72">
          {programData.length === 0 ? (
            <p className="text-muted-foreground">PÇ verisi yok.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={programData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="code" />
                <Radar
                  name="Başarı %"
                  dataKey="success"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.4}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

