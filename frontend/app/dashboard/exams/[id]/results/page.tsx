"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { examApi, type ExamAnalysisResponse } from "@/lib/api/examApi";
import { Bar, BarChart, CartesianGrid, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Download, Loader2, ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type QuestionRow = ExamAnalysisResponse["questionAnalysis"][number];
type OutcomeRow = ExamAnalysisResponse["learningOutcomeAnalysis"][number];
type ProgramRow = ExamAnalysisResponse["programOutcomeAnalysis"][number];

interface ExamResult {
  _id: string;
  studentNumber: string;
  questionScores: Array<{
    questionNumber: number;
    score: number;
    learningOutcomeCode: string | null;
  }>;
  totalScore: number;
  maxTotalScore: number;
  percentage: number;
  createdAt: string;
  updatedAt: string;
}

export default function ExamResultsPage() {
  const params = useParams();
  const examId = params.id as string;

  const [results, setResults] = useState<ExamResult[]>([]);
  const [exam, setExam] = useState<any>(null);
  const [analysis, setAnalysis] = useState<ExamAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
  const [activeTab, setActiveTab] = useState("students");

  useEffect(() => {
    if (examId) {
      loadExam();
      loadResults();
      loadAnalysis();
    }
  }, [examId]);

  const loadExam = async () => {
    try {
      const data = await examApi.getById(examId);
      setExam(data);
    } catch (error: any) {
      toast.error("Sınav bilgileri yüklenemedi");
    }
  };

  const loadResults = async () => {
    try {
      setIsLoading(true);
      const data = await examApi.getResults(examId);
      setResults(data);
    } catch (error: any) {
      toast.error("Sonuçlar yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalysis = async () => {
    try {
      setIsLoadingAnalysis(true);
      const data = await examApi.getAnalysis(examId);
      setAnalysis(data);
    } catch (error: any) {
      toast.error("Analiz yüklenemedi");
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const questionData = useMemo<QuestionRow[]>(() => analysis?.questionAnalysis || [], [analysis]);
  const outcomeData = useMemo<OutcomeRow[]>(() => analysis?.learningOutcomeAnalysis || [], [analysis]);
  const programData = useMemo<ProgramRow[]>(() => analysis?.programOutcomeAnalysis || [], [analysis]);

  const handleExport = () => {
    // CSV export
    const headers = ["Öğrenci No", ...Array.from({ length: exam?.questionCount || 0 }, (_, i) => `Soru ${i + 1}`), "Toplam", "Max", "Yüzde"];
    const rows = results.map((result) => [
      result.studentNumber,
      ...Array.from({ length: exam?.questionCount || 0 }, (_, i) => {
        const qs = result.questionScores.find((qs) => qs.questionNumber === i + 1);
        return qs?.score || 0;
      }),
      result.totalScore,
      result.maxTotalScore,
      `${result.percentage}%`,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `sınav-sonuçları-${exam?.examCode || examId}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || isLoadingAnalysis) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/exams">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Sınav Sonuçları</h1>
          </div>
          <p className="text-muted-foreground">
            {exam?.examCode && (
              <>
                <Badge variant="outline" className="mr-2">{exam.examCode}</Badge>
                {exam.courseId && typeof exam.courseId === 'object' && (
                  <span>{exam.courseId.name}</span>
                )}
              </>
            )}
          </p>
        </div>
        <Button onClick={() => window.print()} className="h-11 px-5">
          <Download className="h-4 w-4 mr-2" />
          PDF oluştur
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Öğrenci Sonuçları ({results.length})
          </TabsTrigger>
          <TabsTrigger value="analysis">Analiz ve Grafikler</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Öğrenci Sonuçları</CardTitle>
                  <CardDescription>
                    {results.length} öğrencinin sınav sonuçları
                  </CardDescription>
                </div>
                {results.length > 0 && (
                  <Button onClick={handleExport} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    CSV İndir
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg font-medium">Henüz sonuç bulunmamaktadır</p>
                  <p className="text-sm mt-2">AI puanlama veya toplu yükleme ile sonuçlar eklendikten sonra burada görünecektir</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Öğrenci No</TableHead>
                        {Array.from({ length: exam?.questionCount || 0 }, (_, i) => (
                          <TableHead key={i + 1} className="text-center w-[80px]">
                            Soru {i + 1}
                          </TableHead>
                        ))}
                        <TableHead className="text-center w-[100px]">Toplam</TableHead>
                        <TableHead className="text-center w-[100px]">Max</TableHead>
                        <TableHead className="text-center w-[100px]">Yüzde</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow key={result._id}>
                          <TableCell className="font-medium">{result.studentNumber}</TableCell>
                          {Array.from({ length: exam?.questionCount || 0 }, (_, i) => {
                            const qs = result.questionScores.find((qs) => qs.questionNumber === i + 1);
                            return (
                              <TableCell key={i + 1} className="text-center">
                                {qs?.score ?? 0}
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-center font-semibold">
                            {result.totalScore}
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {result.maxTotalScore}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                result.percentage >= 70
                                  ? "default"
                                  : result.percentage >= 50
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {result.percentage}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {!analysis ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <p>Analiz verisi yüklenemedi</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Soru → ÖÇ Tablosu</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full border text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-2 border">Soru</th>
                        <th className="p-2 border">ÖÇ</th>
                        <th className="p-2 border">Ortalama</th>
                        <th className="p-2 border">Başarı %</th>
                        <th className="p-2 border">Cevap Veren</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questionData.map((q) => (
                        <tr key={q.questionNumber} className="text-center">
                          <td className="border p-2">{q.questionNumber}</td>
                          <td className="border p-2">{q.learningOutcomeCode || "-"}</td>
                          <td className="border p-2">{q.averageScore}</td>
                          <td className="border p-2">{q.successRate}%</td>
                          <td className="border p-2">{q.attempts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ÖÇ Başarı Grafiği</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
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
                <CardHeader>
                  <CardTitle>PÇ Radar Grafiği</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
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
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
