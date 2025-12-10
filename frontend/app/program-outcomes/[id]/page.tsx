"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgramOutcomeForm } from "@/components/programOutcomes/ProgramOutcomeForm";
import { programOutcomeApi, type ProgramOutcome } from "@/lib/api/programOutcomeApi";

export default function EditProgramOutcomePage() {
  const params = useParams();
  const router = useRouter();
  const programOutcomeId = params.id as string;
  const [programOutcome, setProgramOutcome] = useState<ProgramOutcome | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (programOutcomeId) {
      fetchProgramOutcome();
    }
  }, [programOutcomeId]);

  const fetchProgramOutcome = async () => {
    try {
      setIsLoading(true);
      const data = await programOutcomeApi.getById(programOutcomeId);
      setProgramOutcome(data);
    } catch (error: any) {
      toast.error("Failed to load program outcome");
      router.push("/program-outcomes");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Program Outcome</h2>
          <p className="text-muted-foreground">Loading program outcome details...</p>
        </div>
      </div>
    );
  }

  if (!programOutcome) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Program Outcome</h2>
        <p className="text-muted-foreground">
          Update program outcome information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program Outcome Information</CardTitle>
          <CardDescription>
            Update the program outcome details below. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramOutcomeForm
            mode="edit"
            programOutcomeId={programOutcomeId}
            initialData={programOutcome}
          />
        </CardContent>
      </Card>
    </div>
  );
}

