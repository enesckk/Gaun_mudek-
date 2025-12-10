"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { departmentApi, type Department } from "@/lib/api/departmentApi";
import { programOutcomeApi, type ProgramOutcome } from "@/lib/api/programOutcomeApi";

export default function ProgramOutcomesPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [programOutcomes, setProgramOutcomes] = useState<ProgramOutcome[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPOs, setLoadingPOs] = useState(false);

  // New PO form
  const [newPOCode, setNewPOCode] = useState("");
  const [newPODescription, setNewPODescription] = useState("");

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartmentId) {
      loadProgramOutcomes();
    } else {
      setProgramOutcomes([]);
    }
  }, [selectedDepartmentId]);

  const loadDepartments = async () => {
    try {
      const data = await departmentApi.getAll();
      setDepartments(data);
    } catch (error: any) {
      toast.error("Bölümler yüklenemedi");
      console.error(error);
    }
  };

  const loadProgramOutcomes = async () => {
    if (!selectedDepartmentId) return;
    try {
      setLoadingPOs(true);
      const data = await programOutcomeApi.getByDepartment(selectedDepartmentId);
      setProgramOutcomes(data || []);
    } catch (error: any) {
      toast.error("Program çıktıları yüklenemedi");
      console.error(error);
      setProgramOutcomes([]);
    } finally {
      setLoadingPOs(false);
    }
  };

  const handleAddPO = async () => {
    if (!selectedDepartmentId) {
      toast.error("Lütfen önce bir bölüm seçin");
      return;
    }
    if (!newPOCode.trim() || !newPODescription.trim()) {
      toast.error("PÇ kodu ve açıklama gereklidir");
      return;
    }

    try {
      setIsLoading(true);
      await programOutcomeApi.add(selectedDepartmentId, {
        code: newPOCode.trim(),
        description: newPODescription.trim(),
      });
      toast.success("Program çıktısı eklendi");
      setNewPOCode("");
      setNewPODescription("");
      await loadProgramOutcomes();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Program çıktısı eklenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePO = async (poCode: string) => {
    if (!selectedDepartmentId) return;
    if (!confirm(`"${poCode}" program çıktısını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      setIsLoading(true);
      await programOutcomeApi.delete(selectedDepartmentId, poCode);
      toast.success("Program çıktısı silindi");
      await loadProgramOutcomes();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Program çıktısı silinemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDepartment = departments.find((d) => d._id === selectedDepartmentId);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <GraduationCap className="h-10 w-10 text-[#0a294e]" />
              Program Çıktıları (PÇ) Yönetimi
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Her bölüm için program çıktılarını tanımlayın ve yönetin
            </p>
          </div>
        </div>

        {/* Department Selection */}
        <Card className="border-2 border-[#0a294e]/20">
          <CardHeader>
            <CardTitle className="text-2xl text-[#0a294e]">Bölüm Seç</CardTitle>
            <CardDescription className="text-base">
              Program çıktılarını yönetmek istediğiniz bölümü seçin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Label htmlFor="department-select" className="text-lg font-semibold">
                Bölüm <span className="text-[#bf1e1d]">*</span>
              </Label>
              <Select
                id="department-select"
                value={selectedDepartmentId}
                onChange={(e) => setSelectedDepartmentId(e.target.value)}
                className="h-14 text-lg"
              >
                <option value="">Bölüm Seçin</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedDepartmentId && (
          <>
            {/* Add New PO */}
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-2xl text-green-700">Yeni Program Çıktısı Ekle</CardTitle>
                <CardDescription className="text-base">
                  {selectedDepartment?.name} bölümü için yeni bir program çıktısı ekleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="po-code" className="text-lg font-semibold">
                      PÇ Kodu <span className="text-[#bf1e1d]">*</span>
                    </Label>
                    <Input
                      id="po-code"
                      value={newPOCode}
                      onChange={(e) => setNewPOCode(e.target.value.toUpperCase())}
                      placeholder="Örn: PÇ1"
                      disabled={isLoading}
                      className="h-14 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="po-description" className="text-lg font-semibold">
                      Açıklama <span className="text-[#bf1e1d]">*</span>
                    </Label>
                    <Input
                      id="po-description"
                      value={newPODescription}
                      onChange={(e) => setNewPODescription(e.target.value)}
                      placeholder="Örn: Matematiksel analiz yapabilme"
                      disabled={isLoading}
                      className="h-14 text-lg"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddPO}
                  disabled={isLoading || !newPOCode.trim() || !newPODescription.trim()}
                  className="h-12 px-8 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Ekleniyor...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Program Çıktısı Ekle
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* PO List */}
            <Card className="border-2 border-[#0a294e]/20">
              <CardHeader>
                <CardTitle className="text-2xl text-[#0a294e]">
                  Program Çıktıları Listesi ({programOutcomes.length})
                </CardTitle>
                <CardDescription className="text-base">
                  {selectedDepartment?.name} bölümü için tanımlı program çıktıları
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPOs ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#0a294e]" />
                    <span className="ml-3 text-lg">Yükleniyor...</span>
                  </div>
                ) : programOutcomes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg">Henüz program çıktısı tanımlanmamış.</p>
                    <p className="text-sm mt-2">Yukarıdaki formdan yeni bir program çıktısı ekleyebilirsiniz.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {programOutcomes.map((po, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-[#0a294e]/30 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-[#0a294e]">{po.code}</span>
                            <span className="text-lg text-gray-700">{po.description}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePO(po.code)}
                          disabled={isLoading}
                          className="text-[#bf1e1d] hover:text-[#bf1e1d] hover:bg-[#bf1e1d]/10"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

