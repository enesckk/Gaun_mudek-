"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgramOutcomeForm } from "@/components/programOutcomes/ProgramOutcomeForm";

export default function NewProgramOutcomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create Program Outcome</h2>
        <p className="text-muted-foreground">
          Add a new program outcome (PÇ) to the system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program Outcome Information</CardTitle>
          <CardDescription>
            Enter the program outcome details below. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramOutcomeForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}

