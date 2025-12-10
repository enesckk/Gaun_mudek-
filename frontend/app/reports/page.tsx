"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { courseApi, type Course } from "@/lib/api/courseApi";

export default function ReportsPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const data = await courseApi.getAll();
      setCourses(data);
    } catch (error: any) {
      toast.error("Failed to load courses");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReport = () => {
    if (!selectedCourseId) {
      toast.error("Please select a course");
      return;
    }
    router.push(`/reports/${selectedCourseId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">MÜDEK Reports</h2>
        <p className="text-muted-foreground">
          Generate comprehensive accreditation reports for courses
        </p>
      </div>

      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-2xl rounded-xl shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Select Course</CardTitle>
                <CardDescription>
                  Choose a course to view detailed MÜDEK accreditation reports
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a course...</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleViewReport}
              disabled={!selectedCourseId || isLoading}
              className="w-full"
              size="lg"
            >
              View Report
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

