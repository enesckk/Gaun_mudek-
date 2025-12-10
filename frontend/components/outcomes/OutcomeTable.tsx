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
import { type LearningOutcome } from "@/lib/api/learningOutcomeApi";
import { DeleteOutcomeDialog } from "./DeleteOutcomeDialog";
import { useState } from "react";

interface OutcomeTableProps {
  outcomes: LearningOutcome[];
  onDelete?: () => void;
}

export function OutcomeTable({ outcomes, onDelete }: OutcomeTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<LearningOutcome | null>(null);

  const handleDeleteClick = (outcome: LearningOutcome) => {
    setSelectedOutcome(outcome);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setSelectedOutcome(null);
    onDelete?.();
  };

  if (outcomes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No learning outcomes found
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
              <TableHead className="text-center">Program Outcomes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {outcomes.map((outcome, index) => (
              <TableRow
                key={outcome._id}
                className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}
              >
                <TableCell className="font-medium">{outcome.code}</TableCell>
                <TableCell className="max-w-md">
                  {outcome.description}
                </TableCell>
                <TableCell className="text-center">
                  {outcome.mappedProgramOutcomes?.length || 0}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                    >
                      <Link href={`/outcomes/${outcome._id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteClick(outcome)}
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

      {selectedOutcome && (
        <DeleteOutcomeDialog
          outcomeId={selectedOutcome._id}
          outcomeCode={selectedOutcome.code}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}






