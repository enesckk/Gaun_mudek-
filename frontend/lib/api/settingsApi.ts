import apiClient from "./apiClient";

export interface SystemStatus {
  apiConnected: boolean;
  mongodbConnected: boolean;
  aiServiceAvailable: boolean;
  counts: {
    courses: number;
    students: number;
    exams: number;
    learningOutcomes: number;
    programOutcomes: number;
  };
}

export interface DataIntegrityIssues {
  missingLOMappings: number;
  missingPOMappings: number;
  questionsWithoutLO: number;
  studentsWithoutScores: number;
  examsWithoutQuestions: number;
}

export const settingsApi = {
  getSystemStatus: async (): Promise<SystemStatus> => {
    try {
      const response = await apiClient.get("/settings/status");
      return response.data.data;
    } catch (error) {
      // Fallback if endpoint doesn't exist
      return {
        apiConnected: true,
        mongodbConnected: true,
        aiServiceAvailable: false,
        counts: {
          courses: 0,
          students: 0,
          exams: 0,
          learningOutcomes: 0,
          programOutcomes: 0,
        },
      };
    }
  },

  getDataIntegrity: async (): Promise<DataIntegrityIssues> => {
    try {
      const response = await apiClient.get("/settings/integrity");
      return response.data.data;
    } catch (error) {
      // Fallback if endpoint doesn't exist
      return {
        missingLOMappings: 0,
        missingPOMappings: 0,
        questionsWithoutLO: 0,
        studentsWithoutScores: 0,
        examsWithoutQuestions: 0,
      };
    }
  },

  getAPIKey: async (): Promise<{ key: string; status: "active" | "invalid" | "not_configured" }> => {
    try {
      const response = await apiClient.get("/settings/api-key");
      return response.data.data;
    } catch (error) {
      return { key: "", status: "not_configured" };
    }
  },

  saveAPIKey: async (key: string): Promise<void> => {
    await apiClient.post("/settings/api-key", { key });
  },

  exportData: async (type: "students" | "courses" | "all" | "mudek"): Promise<Blob> => {
    const response = await apiClient.get(`/settings/export/${type}`, {
      responseType: "blob",
    });
    return response.data;
  },
};

