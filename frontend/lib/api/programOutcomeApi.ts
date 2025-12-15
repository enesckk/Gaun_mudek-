import apiClient from "./apiClient";

export interface ProgramOutcome {
  _id?: string;
  code: string;
  description: string;
}

export interface DepartmentProgramOutcomes {
  departmentId: string;
  programOutcomes: ProgramOutcome[];
}

export const programOutcomeApi = {
  // Get all program outcomes for a program (new - preferred)
  getByProgram: async (programId: string): Promise<ProgramOutcome[]> => {
    const response = await apiClient.get(`/program-outcomes/program/${programId}`);
    return response.data.data || [];
  },

  // Add a program outcome to a program (new - preferred)
  addToProgram: async (programId: string, po: ProgramOutcome): Promise<ProgramOutcome[]> => {
    const response = await apiClient.post(`/program-outcomes/program/${programId}/add`, po);
    return response.data.data || [];
  },

  // Update all program outcomes for a program (new - preferred)
  updateProgram: async (programId: string, programOutcomes: ProgramOutcome[]): Promise<ProgramOutcome[]> => {
    const response = await apiClient.put(`/program-outcomes/program/${programId}/update`, {
      programOutcomes,
    });
    return response.data.data || [];
  },

  // Delete a specific program outcome from a program (new - preferred)
  deleteFromProgram: async (programId: string, code: string): Promise<ProgramOutcome[]> => {
    const response = await apiClient.delete(`/program-outcomes/program/${programId}/delete`, {
      data: { code },
    });
    return response.data.data || [];
  },

  // Get all program outcomes for a department (legacy - aggregates from all programs)
  getByDepartment: async (departmentId: string): Promise<ProgramOutcome[]> => {
    const response = await apiClient.get(`/program-outcomes/${departmentId}`);
    return response.data.data || [];
  },

  // Add a program outcome to a department (legacy - for backward compatibility)
  add: async (departmentId: string, po: ProgramOutcome): Promise<ProgramOutcome[]> => {
    const response = await apiClient.post(`/program-outcomes/${departmentId}/add`, po);
    return response.data.data || [];
  },

  // Update all program outcomes for a department (legacy)
  update: async (departmentId: string, programOutcomes: ProgramOutcome[]): Promise<ProgramOutcome[]> => {
    const response = await apiClient.put(`/program-outcomes/${departmentId}/update`, {
      programOutcomes,
    });
    return response.data.data || [];
  },

  // Delete a specific program outcome from a department (legacy)
  delete: async (departmentId: string, code: string): Promise<ProgramOutcome[]> => {
    const response = await apiClient.delete(`/program-outcomes/${departmentId}/delete`, {
      data: { code },
    });
    return response.data.data || [];
  },

  // Legacy: Get all program outcomes (deprecated)
  getAll: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get("/program-outcomes");
      return response.data.data || [];
    } catch (error) {
      console.warn("Legacy program outcomes endpoint failed, returning empty array");
      return [];
    }
  },
};
