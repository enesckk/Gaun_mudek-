import apiClient from "./apiClient";

export interface Course {
  _id: string;
  name: string;
  code: string;
  description?: string;
  department?: string | { _id: string; name: string; code?: string };
  semester?: string;
  learningOutcomes?: Array<{ code: string; description: string }>;
  learningOutcomesCount?: number;
  midtermExam?: {
    examCode: string;
    questionCount: number;
    maxScorePerQuestion: number;
  };
  finalExam?: {
    examCode: string;
    questionCount: number;
    maxScorePerQuestion: number;
  };
  students?: Array<{ studentNumber: string; fullName: string }>;
  studentsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningOutcomeInput {
  code: string;
  description: string;
}

export interface ExamSettingsInput {
  examCode: string;
  questionCount: number;
  maxScorePerQuestion: number;
}

export interface StudentInput {
  studentNumber: string;
  fullName: string;
}

export interface CreateCourseDto {
  name: string;
  code: string;
  description?: string;
  departmentId: string;
  semester?: string;
  learningOutcomes?: LearningOutcomeInput[];
  midtermExam?: ExamSettingsInput;
  finalExam?: ExamSettingsInput;
  students?: StudentInput[];
}

export interface UpdateCourseDto {
  name?: string;
  code?: string;
  description?: string;
  departmentId?: string;
  semester?: string;
  learningOutcomes?: LearningOutcomeInput[];
  midtermExam?: ExamSettingsInput;
  finalExam?: ExamSettingsInput;
  students?: StudentInput[];
}

export const courseApi = {
  getAll: async (): Promise<Course[]> => {
    const response = await apiClient.get("/courses");
    return response.data.courses || response.data.data || [];
  },

  getById: async (id: string): Promise<Course> => {
    const response = await apiClient.get(`/courses/${id}`);
    return response.data.course || response.data.data;
  },

  createCourse: (data: CreateCourseDto) => apiClient.post("/courses/create", data),

  updateCourse: (id: string, data: UpdateCourseDto) => apiClient.put(`/courses/${id}`, data),

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/courses/${id}`);
  },

  getMatrix: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/courses/${id}/matrix`);
    return response.data;
  },
};
