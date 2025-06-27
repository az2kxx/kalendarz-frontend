import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client'; 
import { cancelBooking } from '../api/booking'; 
import type { AdminBooking } from '../api/booking';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { AvailabilitySettings } from '../components/AvailabilitySettings';
import { EditBookingModal } from '../components/EditBookingModal'; 

const fetchMyBookings = async (): Promise<AdminBooking[]> => {
  const { data } = await apiClient.get('/api/admin/bookings');
  return data;
};

const ShareCalendar = ({ userId }: { userId: string | null }) => {
    const [copied, setCopied] = useState(false);
    if (!userId) return null;
    const bookingUrl = `${window.location.origin}/book/${userId}`;
    const handleCopy = () => {
        navigator.clipboard.writeText(bookingUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Udostępnij Swój Kalendarz</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Wyślij ten link swoim klientom.</p>
            <div className="flex items-stretch">
                <input type="text" value={bookingUrl} readOnly className="flex-grow bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md px-3 py-2 focus:outline-none"/>
                <button onClick={handleCopy} className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">{copied ? 'Skopiowano!' : 'Kopiuj'}</button>
            </div>
        </div>
    )
}

export const DashboardPage = () => {
  const { data: bookings, isLoading, error } = useQuery<AdminBooking[]>({
    queryKey: ['myBookings'], 
    queryFn: fetchMyBookings,
  });

  const queryClient = useQueryClient();
  const { logout, auth } = useAuth();
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<AdminBooking | null>(null);

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      alert('Rezerwacja została anulowana.');
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
    onError: (error) => {
      alert(`Błąd podczas anulowania: ${error.message}`);
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditClick = (booking: AdminBooking) => {
    setEditingBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleCancelClick = (bookingId: string) => {
    if (window.confirm('Czy na pewno chcesz anulować tę rezerwację? Tej akcji nie można cofnąć.')) {
      cancelMutation.mutate(bookingId);
    }
  };
  
  const isActionDisabled = cancelMutation.isPending;

  const renderContent = () => {
    if (isLoading) {
      return <div className="p-8 text-center">Ładowanie danych panelu...</div>;
    }

    if (error) {
      return <div className="p-8 text-center text-red-500">Błąd: {error.message}</div>;
    }
    
    return (
      <div className="space-y-8">
        <ShareCalendar userId={auth.user.userId} />
        <AvailabilitySettings />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-semibold p-6 text-gray-900 dark:text-gray-100">Rezerwacje dla {auth.user.name}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data i Godzina</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gość</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Akcje</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {bookings && bookings.length > 0 ? (
                          bookings.map((booking) => (
                          <tr key={booking.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{new Date(booking.startTime).toLocaleString('pl-PL')}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{booking.guestName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{booking.guestEmail}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={() => handleEditClick(booking)}
                                    disabled={isActionDisabled}
                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    Edytuj
                                  </button>
                                  <button
                                    onClick={() => handleCancelClick(booking.id)}
                                    disabled={isActionDisabled}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {cancelMutation.isPending && cancelMutation.variables === booking.id ? 'Anulowanie...' : 'Anuluj'}
                                  </button>
                                </div>
                              </td>
                          </tr>
                          ))
                      ) : (
                          <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Brak rezerwacji do wyświetlenia.</td></tr>
                      )}
                  </tbody>
              </table>
            </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-16 sm:p-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Panel Administratora</h1>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Wyloguj się</button>
        </div>
        {renderContent()}
      </div>

      <EditBookingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        booking={editingBooking}
      />
    </main>
  );
};