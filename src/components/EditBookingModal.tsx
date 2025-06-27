import { useForm,  } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { updateBooking } from '../api/booking';
import type { AdminBooking, UpdateBookingData } from '../api/booking';

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: AdminBooking | null;
}

export const EditBookingModal = ({ isOpen, onClose, booking }: EditBookingModalProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateBookingData>();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (booking) {
      reset({
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        notes: booking.notes || '',
      });
    }
  }, [booking, reset, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: UpdateBookingData) => updateBooking(booking!.id, data),
    onSuccess: () => {
      alert('Rezerwacja została zaktualizowana!');
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      onClose();
    },
    onError: (error) => {
      alert(`Błąd aktualizacji: ${error.message}`);
    },
  });

  const onSubmit: SubmitHandler<UpdateBookingData> = (data) => {
    mutation.mutate(data);
  };

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Edytuj Rezerwację</h2>
        <p className="text-sm text-gray-500 mb-6">
          Termin: {booking ? new Date(booking.startTime).toLocaleString('pl-PL') : ''}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Imię i nazwisko gościa</label>
            <input
              {...register('guestName', { required: 'Imię jest wymagane' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
            />
            {errors.guestName && <p className="text-red-500 text-xs mt-1">{errors.guestName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email gościa</label>
            <input
              type="email"
              {...register('guestEmail', { required: 'Email jest wymagany' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
            />
            {errors.guestEmail && <p className="text-red-500 text-xs mt-1">{errors.guestEmail.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notatki</label>
            <textarea
              {...register('notes')}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
              placeholder="Dodaj opcjonalne notatki..."
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {mutation.isPending ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};