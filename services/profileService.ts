import { apiClient } from "@/services/api/client";
import type {
  BasicProfileResponse,
  PersonalStatsResponse,
  UpdateProfileResponse,
  UserBadgesResponse,
} from "@/types/profile";

export const profileService = {
  async getBasicProfile(): Promise<BasicProfileResponse> {
    const response = await apiClient.get<BasicProfileResponse>(
      "/api/v1/profile",
    );
    return response.data;
  },

  async getPersonalStats(): Promise<PersonalStatsResponse> {
    const response = await apiClient.get<PersonalStatsResponse>(
      "/api/v1/profile/stats",
    );
    return response.data;
  },

  async getUserBadges(): Promise<UserBadgesResponse> {
    const response = await apiClient.get<UserBadgesResponse>(
      "/api/v1/profile/badges?limit=50&offset=0",
    );
    return response.data;
  },

  async updateProfile(body: {
    username?: string;
    full_name?: string;
  }): Promise<UpdateProfileResponse> {
    const response = await apiClient.patch<UpdateProfileResponse>(
      "/api/v1/profile",
      body,
    );
    return response.data;
  },
};
