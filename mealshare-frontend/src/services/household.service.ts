import api from './api';
import type {
  Household,
  CreateHouseholdDto,
  UpdateHouseholdDto,
  AddMemberDto,
} from '../types/household.types';
import type { ApiResponse } from '../types/api.types';

export const householdService = {
  create: async (data: CreateHouseholdDto): Promise<Household> => {
    const response = await api.post<any, ApiResponse<Household>>(
      '/households',
      data
    );
    return response.data;
  },

  getMyHousehold: async (): Promise<Household | null> => {
    const response = await api.get<any, ApiResponse<Household | null>>(
      '/households/my-household'
    );
    return response.data;
  },

  getById: async (householdId: string): Promise<Household> => {
    const response = await api.get<any, ApiResponse<Household>>(
      `/households/${householdId}`
    );
    return response.data;
  },

  update: async (
    householdId: string,
    data: UpdateHouseholdDto
  ): Promise<Household> => {
    const response = await api.put<any, ApiResponse<Household>>(
      `/households/${householdId}`,
      data
    );
    return response.data;
  },

  addMember: async (householdId: string, data: AddMemberDto): Promise<any> => {
    const response = await api.post<any, ApiResponse<any>>(
      `/households/${householdId}/members`,
      data
    );
    return response.data;
  },

  removeMember: async (householdId: string, userId: string): Promise<void> => {
    await api.delete(`/households/${householdId}/members/${userId}`);
  },

  leave: async (householdId: string): Promise<void> => {
    await api.delete(`/households/${householdId}/leave`);
  },
};
