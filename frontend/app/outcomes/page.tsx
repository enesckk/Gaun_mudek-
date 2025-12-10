"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OutcomeTable } from "@/components/outcomes/OutcomeTable";
import { learningOutcomeApi, type LearningOutcome } from "@/lib/api/learningOutcomeApi";
import { courseApi } from "@/lib/api/courseApi";

export default function OutcomesPage() {
  const router = useRouter();
  const [outcomes, setOutcomes] = useState<LearningOutcome[]>([]);
  const [filteredOutcomes, setFilteredOutcomes] = useState<LearningOutcome[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllOutcomes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOutcomes(outcomes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = outcomes.filter(
        (outcome) =>
          outcome.code.toLowerCase().includes(query) ||
          outcome.description.toLowerCase().includes(query)
      );
      setFilteredOutcomes(filtered);
    }
  }, [searchQuery, outcomes]);

  const fetchAllOutcomes = async () => {
    try {
      setIsLoading(true);
      // Fetch all courses and then get outcomes for each
      const courses = await courseApi.getAll();
      const allOutcomes: LearningOutcome[] = [];

      for (const course of courses) {
        try {
          const courseOutcomes = await learningOutcomeApi.getByCourse(course._id);
          allOutcomes.push(...courseOutcomes);
        } catch (error) {
          // Skip courses without outcomes
          console.error(`Failed to fetch outcomes for course ${course._id}`);
        }
      }

      setOutcomes(allOutcomes);
      setFilteredOutcomes(allOutcomes);
    } catch (error: any) {
      toast.error("Failed to load learning outcomes");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Learning Outcomes (ÖÇ)</h2>
          <p className="text-muted-foreground">
            Manage learning outcomes and map them to program outcomes
          </p>
        </div>
        <Button onClick={() => router.push("/outcomes/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Learning Outcome
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learning Outcomes List</CardTitle>
          <CardDescription>
            All learning outcomes in the system. Click edit to modify or delete to remove.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading learning outcomes...
            </div>
          ) : (
            <OutcomeTable outcomes={filteredOutcomes} onDelete={fetchAllOutcomes} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}






