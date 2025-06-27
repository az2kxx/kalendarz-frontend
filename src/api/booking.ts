import { apiClient } from './client';

export type CreateBookingData = {
  startTime: string; 
  guestName: string;
  guestEmail: string;
}

export type BookingConfirmation = {
  id: string;
  startTime: string;
  endTime: string;
  host: {
    name: string;
    email: string;
  };
};

export type AdminBooking = {
  id: string;
  startTime: string;
  endTime: string;
  guestName:string;
  guestEmail: string;
  notes: string | null;
};

export const getAvailableSlots = async (userId: string, date: string): Promise<Date[]> => {
  const response = await apiClient.get(`/api/booking/${userId}/slots?date=${date}`);
  return response.data.map((slot: string) => new Date(slot));
};

export const createBooking = async (userId: string, data: CreateBookingData): Promise<BookingConfirmation> => {
  const response = await apiClient.post(`/api/booking/${userId}/book`, data);
  return response.data;
};



export type UpdateBookingData = {
  guestName: string;
  guestEmail: string;
  notes: string | null;
};


export const updateBooking = async (bookingId: string, data: UpdateBookingData): Promise<AdminBooking> => {
  const response = await apiClient.put(`/api/admin/bookings/${bookingId}`, data);
  return response.data;
};


export const cancelBooking = async (bookingId: string): Promise<void> => {
  await apiClient.delete(`/api/admin/bookings/${bookingId}`);
};