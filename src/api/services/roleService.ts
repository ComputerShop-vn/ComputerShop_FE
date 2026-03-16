// Role Service
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { RoleResponse, RoleCreationRequest, RoleUpdateRequest } from '../types/role';

export const roleService = {
  // Get all roles (requires ADMIN)
  getAllRoles: async (): Promise<RoleResponse[]> => {
    const response = await apiClient.get<RoleResponse[]>(
      API_ENDPOINTS.ROLES,
      true
    );
    return response.result || [];
  },

  // Get role by ID (requires ADMIN)
  getRoleById: async (id: number): Promise<RoleResponse> => {
    const response = await apiClient.get<RoleResponse>(
      API_ENDPOINTS.ROLE_BY_ID(id),
      true
    );
    if (!response.result) {
      throw new Error('Role not found');
    }
    return response.result;
  },

  // Create role (requires ADMIN)
  createRole: async (data: RoleCreationRequest): Promise<RoleResponse> => {
    const response = await apiClient.post<RoleResponse>(
      API_ENDPOINTS.ROLES,
      data,
      true
    );
    if (!response.result) {
      throw new Error('Failed to create role');
    }
    return response.result;
  },

  // Update role (requires ADMIN)
  updateRole: async (id: number, data: RoleUpdateRequest): Promise<RoleResponse> => {
    const response = await apiClient.put<RoleResponse>(
      API_ENDPOINTS.ROLE_BY_ID(id),
      data,
      true
    );
    if (!response.result) {
      throw new Error('Failed to update role');
    }
    return response.result;
  },

  // Delete role (requires ADMIN)
  deleteRole: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.ROLE_BY_ID(id), true);
  },
};
