import apiClient from "./apiClient";

import { Program } from "./programApi";

export interface Department {
  _id: string;
  code?: string;
  name: string;
  nameEn?: string;
  programs?: Program[] | string[];
  programOutcomes?: Array<{
    code: string;
    description: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export const departmentApi = {
  getAll: async (): Promise<Department[]> => {
    const response = await apiClient.get("/departments");
    return response.data.data || [];
  },

  seed: async (): Promise<void> => {
    await apiClient.post("/departments/seed");
  },
};

