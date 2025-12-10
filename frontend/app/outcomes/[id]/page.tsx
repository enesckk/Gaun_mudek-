"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OutcomeForm } from "@/components/outcomes/OutcomeForm";
import { learningOutcomeApi, type LearningOutcome } from "@/lib/api/learningOutcomeApi";

export default function EditOutcomePage() {
  const params = useParams();
  const router = useRouter();
  const outcomeId = params.id as string;
  const [outcome, setOutcome] = useState<LearningOutcome | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (outcomeId) {
      fetchOutcome();
    }
  }, [outcomeId]);

  const fetchOutcome = async () => {
    try {
      setIsLoading(true);
      const data = await learningOutcomeApi.getById(outcomeId);
      setOutcome(data);
    } catch (error: any) {
      toast.error("Failed to load learning outcome");
      router.push("/outcomes");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Learning Outcome</h2>
          <p className="text-muted-foreground">Loading learning outcome details...</p>
        </div>
      </div>
    );
  }

  if (!outcome) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Learning Outcome</h2>
        <p className="text-muted-foreground">
          Update learning outcome information and program outcome mappings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learning Outcome Information</CardTitle>
          <CardDescription>
            Update the learning outcome details below. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OutcomeForm mode="edit" outcomeId={outcomeId} initialData={outcome} />
        </CardContent>
      </Card>
    </div>
  );
}






