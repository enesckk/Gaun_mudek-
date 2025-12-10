"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExamForm } from "@/components/exams/ExamForm";

export default function NewExamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Yeni Sınav Oluştur</h2>
        <p className="text-muted-foreground">MÜDEK uyumlu sınav oluşturun (Soru → ÖÇ → PÇ otomatik).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sınav Bilgileri</CardTitle>
          <CardDescription>Tüm alanlar zorunludur. Sorular otomatik ÖÇ seçimi ile kaydedilir.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExamForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}

