import apiClient from "./apiClient";

export interface LearningOutcome {
  _id: string;
  courseId: string;
  code: string;
  description: string;
  mappedProgramOutcomes?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLearningOutcomeDto {
  courseId: string;
  code: string;
  description: string;
  mappedProgramOutcomes?: string[];
}

export interface UpdateLearningOutcomeDto {
  code?: string;
  description?: string;
  mappedProgramOutcomes?: string[];
}

export const learningOutcomeApi = {
  getByCourse: async (courseId: string): Promise<LearningOutcome[]> => {
    const response = await apiClient.get(
      `/learning-outcomes/course/${courseId}`
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<LearningOutcome> => {
    const response = await apiClient.get(`/learning-outcomes/${id}`);
    return response.data.data;
  },

  create: async (
    data: CreateLearningOutcomeDto
  ): Promise<LearningOutcome> => {
    const response = await apiClient.post("/learning-outcomes", data);
    return response.data.data;
  },

  update: async (
    id: string,
    data: UpdateLearningOutcomeDto
  ): Promise<LearningOutcome> => {
    const response = await apiClient.put(`/learning-outcomes/${id}`, data);
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/learning-outcomes/${id}`);
  },
};

