"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExamForm } from "@/components/exams/ExamForm";
import { examApi, type Exam } from "@/lib/api/examApi";

export default function EditExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (examId) {
      fetchExamData();
    }
  }, [examId]);

  const fetchExamData = async () => {
    try {
      setIsLoading(true);
      const examData = await examApi.getById(examId);
      setExam(examData);
    } catch (error: any) {
      toast.error("Sınav verileri yüklenemedi");
      router.push("/exams");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sınav Düzenle</h2>
          <p className="text-muted-foreground">Sınav bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Sınav Düzenle</h2>
        <p className="text-muted-foreground">
          Sınav bilgilerini ve soru → ÖÇ eşleşmelerini güncelleyin
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sınav Bilgileri</CardTitle>
          <CardDescription>
            Sınav detaylarını ve soruların ÖÇ eşleşmelerini güncelleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExamForm
            mode="edit"
            examId={examId}
            initialData={exam}
            onSuccess={fetchExamData}
          />
        </CardContent>
      </Card>
    </div>
  );
}

