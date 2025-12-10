"use client";

import { useState } from "react";
import { Play, CheckCircle2, XCircle, Loader2, Terminal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface TestResult {
  status: "pending" | "running" | "success" | "error";
  output: string[];
  error?: string;
}

interface TestCardProps {
  testName: string;
  description: string;
  onRun: () => Promise<TestResult>;
}

export function TestCard({ testName, description, onRun }: TestCardProps) {
  const [result, setResult] = useState<TestResult>({
    status: "pending",
    output: [],
  });
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setResult({
      status: "running",
      output: ["Starting test..."],
    });

    try {
      const testResult = await onRun();
      setResult(testResult);
    } catch (error: any) {
      setResult({
        status: "error",
        output: result.output,
        error: error.message || "Test failed with unknown error",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusBadge = () => {
    switch (result.status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-500 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Success
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      case "running":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Running
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Not Run
          </Badge>
        );
    }
  };

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{testName}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleRun}
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Test...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Test
            </>
          )}
        </Button>

        {result.output.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Terminal className="h-4 w-4" />
              Output Log
            </div>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-auto max-h-64">
              {result.output.map((line, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-500">$</span> {line}
                </div>
              ))}
              {result.error && (
                <div className="mt-2 text-red-400">
                  <span className="text-gray-500">ERROR:</span> {result.error}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

