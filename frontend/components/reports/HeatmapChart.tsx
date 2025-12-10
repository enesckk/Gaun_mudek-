"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type Student } from "@/lib/api/studentApi";
import { type LOAchievement } from "@/lib/api/scoreApi";

interface HeatmapChartProps {
  students: Student[];
  learningOutcomes: { _id: string; code: string }[];
  studentAchievements: Record<string, LOAchievement[]>;
}

export function HeatmapChart({
  students,
  learningOutcomes,
  studentAchievements,
}: HeatmapChartProps) {
  const getHeatmapColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    if (percentage >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getTextColor = (percentage: number) => {
    if (percentage >= 60) return "text-white";
    return "text-white";
  };

  const getCellValue = (studentId: string, loId: string): number => {
    const achievements = studentAchievements[studentId] || [];
    const achievement = achievements.find(
      (a) => a.learningOutcome._id === loId
    );
    return achievement ? achievement.achievedPercentage : 0;
  };

  if (students.length === 0 || learningOutcomes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>LO vs Student Heatmap</CardTitle>
          <CardDescription>
            Achievement percentage for each Learning Outcome by Student
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle>LO vs Student Heatmap</CardTitle>
        <CardDescription>
          Achievement percentage for each Learning Outcome by Student
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 text-left font-medium bg-muted/50 sticky left-0 z-10">
                    LO / Student
                  </th>
                  {students.map((student) => (
                    <th
                      key={student._id}
                      className="border p-2 text-xs font-medium bg-muted/50 min-w-[80px]"
                    >
                      <div className="flex flex-col">
                        <span>{student.studentNumber}</span>
                        <span className="text-muted-foreground text-[10px] truncate max-w-[80px]">
                          {student.name}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {learningOutcomes.map((lo, loIndex) => (
                  <tr key={lo._id} className={loIndex % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                    <td className="border p-2 font-medium bg-muted/50 sticky left-0 z-10">
                      {lo.code}
                    </td>
                    {students.map((student) => {
                      const value = getCellValue(student._id, lo._id);
                      return (
                        <td
                          key={student._id}
                          className={`border p-2 text-center ${getHeatmapColor(value)} ${getTextColor(value)}`}
                        >
                          <span className="font-semibold text-xs">
                            {value.toFixed(0)}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span>0-40%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded" />
            <span>40-60%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded" />
            <span>60-80%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span>80-100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

