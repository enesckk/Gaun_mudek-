import apiClient from "./apiClient";

export interface Score {
  _id: string;
  studentId: string | { _id: string; studentNumber: string; name: string };
  examId: string | { _id: string; title: string; type: string };
  questionId: string | {
    _id: string;
    number: number;
    maxScore: number;
    mappedLearningOutcome?: string | { _id: string; code: string; description?: string };
  };
  scoreValue: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubmitScoreDto {
  studentId: string;
  examId: string;
  questionId: string;
  scoreValue: number;
}

export interface LOAchievement {
  learningOutcome: {
    _id: string;
    code: string;
    description: string;
  };
  achievedPercentage: number;
  totalScoreEarned: number;
  totalMaxScore: number;
}

export interface POAchievement {
  programOutcome: {
    _id: string;
    code: string;
    description: string;
  };
  achievedPercentage: number;
  contributingLOs: number;
}

export const scoreApi = {
  submit: async (data: SubmitScoreDto): Promise<Score> => {
    const response = await apiClient.post("/scores/submit", data);
    return response.data.data;
  },

  getByStudent: async (studentId: string): Promise<Score[]> => {
    const response = await apiClient.get(`/scores/student/${studentId}`);
    return response.data.data;
  },

  getByExam: async (examId: string): Promise<Score[]> => {
    const response = await apiClient.get(`/scores/exam/${examId}`);
    return response.data.data;
  },

  getByStudentForExam: async (
    studentId: string,
    examId: string
  ): Promise<Score[]> => {
    const response = await apiClient.get(
      `/scores/student/${studentId}/exam/${examId}`
    );
    return response.data.data;
  },

  calculateLOAchievement: async (
    studentId: string | null,
    courseId: string
  ): Promise<LOAchievement[]> => {
    if (!studentId) {
      // Aggregate for all students - fetch all students and calculate
      const { studentApi } = await import("./studentApi");
      const students = await studentApi.getAll();
      const allAchievements: Record<string, LOAchievement> = {};

      for (const student of students) {
        try {
          // Call backend API directly to avoid recursion
          const response = await apiClient.post("/scores/lo-achievement", {
            studentId: student._id,
            courseId,
          });
          const achievements: LOAchievement[] = response.data.data;
          
          achievements.forEach((achievement) => {
            const loId = achievement.learningOutcome._id;
            if (!allAchievements[loId]) {
              allAchievements[loId] = {
                learningOutcome: achievement.learningOutcome,
                achievedPercentage: 0,
                totalScoreEarned: 0,
                totalMaxScore: achievement.totalMaxScore,
              };
            }
            allAchievements[loId].totalScoreEarned += achievement.totalScoreEarned;
            // Use max score from first student (should be same for all)
          });
        } catch (error) {
          console.error(`Failed to calculate LO achievement for student ${student._id}`);
        }
      }

      // Calculate average percentages
      return Object.values(allAchievements).map((achievement) => ({
        ...achievement,
        achievedPercentage:
          achievement.totalMaxScore > 0
            ? (achievement.totalScoreEarned / achievement.totalMaxScore) * 100
            : 0,
      }));
    }

    const response = await apiClient.post("/scores/lo-achievement", {
      studentId,
      courseId,
    });
    return response.data.data;
  },

  calculatePOAchievement: async (
    studentId: string | null,
    courseId: string
  ): Promise<POAchievement[]> => {
    if (!studentId) {
      // Aggregate for all students
      const { studentApi } = await import("./studentApi");
      const students = await studentApi.getAll();
      const allAchievements: Record<string, POAchievement & { percentages: number[] }> = {};

      for (const student of students) {
        try {
          // Call backend API directly to avoid recursion
          const response = await apiClient.post("/scores/po-achievement", {
            studentId: student._id,
            courseId,
          });
          const achievements: POAchievement[] = response.data.data;
          
          achievements.forEach((achievement) => {
            const poId = achievement.programOutcome._id;
            if (!allAchievements[poId]) {
              allAchievements[poId] = {
                programOutcome: achievement.programOutcome,
                achievedPercentage: 0,
                contributingLOs: achievement.contributingLOs,
                percentages: [],
              };
            }
            allAchievements[poId].percentages.push(achievement.achievedPercentage);
          });
        } catch (error) {
          console.error(`Failed to calculate PO achievement for student ${student._id}`);
        }
      }

      // Calculate average percentages
      return Object.values(allAchievements).map((achievement) => ({
        programOutcome: achievement.programOutcome,
        contributingLOs: achievement.contributingLOs,
        achievedPercentage:
          achievement.percentages.length > 0
            ? achievement.percentages.reduce((a, b) => a + b, 0) / achievement.percentages.length
            : 0,
      }));
    }

    const response = await apiClient.post("/scores/po-achievement", {
      studentId,
      courseId,
    });
    return response.data.data;
  },
};

