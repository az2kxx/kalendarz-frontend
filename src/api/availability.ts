import { apiClient } from './client';

export type AvailabilitySetting = {
  id: number;
  dayOfWeek: number; 
  startTime: string; 
  endTime: string;   
  userId: string;
};

export type UpdateAvailabilityPayload = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}[];

export const fetchAvailability = async (): Promise<AvailabilitySetting[]> => {
    const { data } = await apiClient.get('/api/availability/');
    return data;
}

export const updateAvailability = async (settings: { availabilities: UpdateAvailabilityPayload }): Promise<AvailabilitySetting[]> => {
    const { data } = await apiClient.post('/api/availability/', settings);
    return data;
};