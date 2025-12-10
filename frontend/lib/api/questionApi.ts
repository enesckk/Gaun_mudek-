import apiClient from "./apiClient";

export interface Question {
  _id: string;
  examId: string;
  number: number;
  maxScore: number;
  mappedLearningOutcomes: string[]; // Array of ÖÇ codes
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQuestionDto {
  examId: string;
  number: number;
  maxScore: number;
  mappedLearningOutcomes: string[]; // Array of ÖÇ codes
}

export interface UpdateQuestionDto {
  number?: number;
  maxScore?: number;
  mappedLearningOutcomes?: string[]; // Array of ÖÇ codes
}

export const questionApi = {
  getByExam: async (examId: string): Promise<Question[]> => {
    const response = await apiClient.get(`/questions/exam/${examId}`);
    return response.data.data;
  },

  getById: async (id: string): Promise<Question> => {
    const response = await apiClient.get(`/questions/${id}`);
    return response.data.data;
  },

  create: async (data: CreateQuestionDto): Promise<Question> => {
    const response = await apiClient.post("/questions", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateQuestionDto): Promise<Question> => {
    const response = await apiClient.put(`/questions/${id}`, data);
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/questions/${id}`);
  },
};

