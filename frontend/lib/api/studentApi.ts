import apiClient from "./apiClient";

export interface ExamResult {
  _id: string;
  examId: string;
  examType?: string;
  examCode?: string;
  courseName?: string;
  courseCode?: string;
  questionScores: Array<{
    questionNumber: number;
    score: number;
    learningOutcomeCode: string | null;
  }>;
  totalScore: number;
  maxTotalScore: number;
  percentage: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  _id: string;
  studentNumber: string;
  name: string;
  department?: string;
  classLevel?: number;
  examResults?: ExamResult[];
  examResultsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStudentDto {
  studentNumber: string;
  name: string;
  department?: string;
  classLevel?: number;
}

export interface UpdateStudentDto {
  name?: string;
  department?: string;
  classLevel?: number;
}

export const studentApi = {
  getAll: async (): Promise<Student[]> => {
    const response = await apiClient.get("/students");
    return response.data.data;
  },

  getById: async (id: string): Promise<Student> => {
    const response = await apiClient.get(`/students/id/${id}`);
    return response.data.data;
  },

  getByNumber: async (studentNumber: string): Promise<Student> => {
    const response = await apiClient.get(`/students/num/${studentNumber}`);
    return response.data.data;
  },

  create: async (data: CreateStudentDto): Promise<Student> => {
    const response = await apiClient.post("/students", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateStudentDto): Promise<Student> => {
    const response = await apiClient.put(`/students/${id}`, data);
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/students/${id}`);
  },
};

