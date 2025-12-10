"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, ExternalLink, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { settingsApi, type DataIntegrityIssues } from "@/lib/api/settingsApi";

export function DataIntegrityCheck() {
  const router = useRouter();
  const [issues, setIssues] = useState<DataIntegrityIssues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchIntegrity();
  }, []);

  const fetchIntegrity = async () => {
    try {
      setIsLoading(true);
      const data = await settingsApi.getDataIntegrity();
      setIssues(data);
    } catch (error) {
      console.error("Failed to fetch integrity data", error);
      // Set default values
      setIssues({
        missingLOMappings: 0,
        missingPOMappings: 0,
        questionsWithoutLO: 0,
        studentsWithoutScores: 0,
        examsWithoutQuestions: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchIntegrity();
    setIsRefreshing(false);
    toast.success("Integrity check refreshed");
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const getTotalIssues = () => {
    if (!issues) return 0;
    return (
      issues.missingLOMappings +
      issues.missingPOMappings +
      issues.questionsWithoutLO +
      issues.studentsWithoutScores +
      issues.examsWithoutQuestions
    );
  };

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Data Integrity Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!issues) return null;

  const integrityItems = [
    {
      label: "Missing LO Mappings",
      count: issues.missingLOMappings,
      path: "/outcomes",
      description: "Learning outcomes without program outcome mappings",
    },
    {
      label: "Missing PO Mappings",
      count: issues.missingPOMappings,
      path: "/program-outcomes",
      description: "Program outcomes not mapped to any learning outcomes",
    },
    {
      label: "Questions without LO",
      count: issues.questionsWithoutLO,
      path: "/exams",
      description: "Exam questions without learning outcome assignments",
    },
    {
      label: "Students without Scores",
      count: issues.studentsWithoutScores,
      path: "/students",
      description: "Students who haven't taken any exams",
    },
    {
      label: "Exams without Questions",
      count: issues.examsWithoutQuestions,
      path: "/exams",
      description: "Exams that don't have any questions",
    },
  ];

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Data Integrity Check
            </CardTitle>
            <CardDescription>
              Identify and fix data inconsistencies in the system
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {getTotalIssues() === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-semibold">All checks passed!</p>
            <p className="text-sm text-muted-foreground mt-2">
              No data integrity issues found
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {integrityItems.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  item.count > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{item.label}</p>
                    {item.count > 0 ? (
                      <Badge variant="destructive">{item.count}</Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-500">
                        OK
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                {item.count > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigate(item.path)}
                  >
                    <ExternalLink className="mr-2 h-3 w-3" />
                    Go to Page
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

