"use client";

import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { type ProgramOutcome } from "@/lib/api/programOutcomeApi";
import { DeleteProgramOutcomeDialog } from "./DeleteProgramOutcomeDialog";
import { useState } from "react";

interface ProgramOutcomeTableProps {
  programOutcomes: ProgramOutcome[];
  learningOutcomeCounts: Record<string, number>;
  onDelete?: () => void;
}

export function ProgramOutcomeTable({
  programOutcomes,
  learningOutcomeCounts,
  onDelete,
}: ProgramOutcomeTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProgramOutcome, setSelectedProgramOutcome] = useState<ProgramOutcome | null>(null);

  const handleDeleteClick = (programOutcome: ProgramOutcome) => {
    setSelectedProgramOutcome(programOutcome);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setSelectedProgramOutcome(null);
    onDelete?.();
  };

  if (programOutcomes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No program outcomes found
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Learning Outcomes Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programOutcomes.map((programOutcome, index) => (
              <TableRow
                key={programOutcome._id}
                className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}
              >
                <TableCell className="font-medium">{programOutcome.code}</TableCell>
                <TableCell className="max-w-md">
                  {programOutcome.description}
                </TableCell>
                <TableCell className="text-center">
                  {learningOutcomeCounts[programOutcome._id] || 0}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                    >
                      <Link href={`/program-outcomes/${programOutcome._id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteClick(programOutcome)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedProgramOutcome && (
        <DeleteProgramOutcomeDialog
          programOutcomeId={selectedProgramOutcome._id}
          programOutcomeCode={selectedProgramOutcome.code}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}

