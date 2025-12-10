"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type Student } from "@/lib/api/studentApi";
import { type LOAchievement } from "@/lib/api/scoreApi";

interface StudentComparisonChartProps {
  students: Student[];
  studentAchievements: Record<string, LOAchievement[]>;
}

export function StudentComparisonChart({
  students,
  studentAchievements,
}: StudentComparisonChartProps) {
  // Calculate overall LO achievement for each student
  const studentData = students.map((student) => {
    const achievements = studentAchievements[student._id] || [];
    const overallPercentage =
      achievements.length > 0
        ? achievements.reduce((sum, a) => sum + a.achievedPercentage, 0) /
          achievements.length
        : 0;
    return {
      studentNumber: student.studentNumber,
      name: student.name,
      percentage: overallPercentage,
    };
  });

  const maxPercentage = Math.max(...studentData.map((d) => d.percentage), 100);

  if (studentData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Comparison</CardTitle>
          <CardDescription>Overall LO Achievement by Student</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No student data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle>Student Comparison</CardTitle>
        <CardDescription>Overall LO Achievement by Student</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {studentData.map((data, index) => {
            const widthPercentage = maxPercentage > 0 ? (data.percentage / maxPercentage) * 100 : 0;
            const color =
              data.percentage >= 80
                ? "bg-green-500"
                : data.percentage >= 60
                ? "bg-yellow-500"
                : "bg-red-500";

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{data.studentNumber}</span>
                    <span className="text-muted-foreground text-xs">
                      {data.name}
                    </span>
                  </div>
                  <span
                    className={`font-semibold ${
                      data.percentage >= 80
                        ? "text-green-600"
                        : data.percentage >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {data.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${color}`}
                    style={{ width: `${widthPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

