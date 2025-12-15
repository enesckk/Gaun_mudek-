import apiClient from "./apiClient";

export interface Program {
  _id: string;
  code: string;
  name: string;
  nameEn?: string;
  department: string | { _id: string; name: string; code?: string };
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProgramDto {
  code: string;
  name: string;
  nameEn?: string;
  departmentId: string;
  description?: string;
}

export interface UpdateProgramDto {
  code?: string;
  name?: string;
  nameEn?: string;
  departmentId?: string;
  description?: string;
}

export const programApi = {
  getAll: async (departmentId?: string): Promise<Program[]> => {
    const params = departmentId ? { departmentId } : {};
    console.log("🌐 programApi.getAll - departmentId:", departmentId);
    console.log("🌐 programApi.getAll - params:", params);
    const response = await apiClient.get("/programs", { params });
    console.log("🌐 programApi.getAll - response:", response.data);
    return response.data.data || [];
  },

  getById: async (id: string): Promise<Program> => {
    const response = await apiClient.get(`/programs/${id}`);
    return response.data.data;
  },

  create: async (data: CreateProgramDto): Promise<Program> => {
    const response = await apiClient.post("/programs", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateProgramDto): Promise<Program> => {
    const response = await apiClient.put(`/programs/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/programs/${id}`);
  },
};

