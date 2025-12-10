"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OutcomeForm } from "@/components/outcomes/OutcomeForm";

export default function NewOutcomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Yeni Öğrenme Çıktısı Oluştur</h2>
        <p className="text-muted-foreground">
          Yeni bir öğrenme çıktısı (ÖÇ) ekleyin ve program çıktıları (PÇ) ile eşleştirin.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Öğrenme Çıktısı Bilgileri</CardTitle>
          <CardDescription>
            Aşağıya öğrenme çıktısı ayrıntılarını girin. * işaretli alanlar zorunludur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OutcomeForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}






