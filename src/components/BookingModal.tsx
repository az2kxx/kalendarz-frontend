import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import type { Event as BigCalendarEvent, View } from 'react-big-calendar';
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parse, startOfWeek, getDay, eachDayOfInterval, endOfWeek, addMinutes, isBefore, startOfToday, startOfMonth, endOfMonth } from 'date-fns';
import { pl } from 'date-fns/locale/pl';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './BookingPage.css'; // <--- IMPORTUJ NOWY PLIK CSS

import { getAvailableSlots, createBooking } from '../api/booking';
import type { CreateBookingData, BookingConfirmation } from '../api/booking';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';


type Inputs = { guestName: string; guestEmail: string; };
const BookingModal = ({ isOpen, onClose, startTime, userId }: { isOpen: boolean; onClose: () => void; startTime: Date | null; userId: string; }) => {
  const { register, handleSubmit, reset } = useForm<Inputs>();
  const queryClient = useQueryClient();
  const [view, setView] = useState<'form' | 'confirmed'>('form');
  const [confirmedBookingData, setConfirmedBookingData] = useState<{ booking: BookingConfirmation, guest: CreateBookingData } | null>(null);
  const bookingMutation = useMutation({
    mutationFn: (bookingData: CreateBookingData) => createBooking(userId, bookingData),
    onSuccess: (bookingConfirmation: BookingConfirmation, submittedData: CreateBookingData) => {
      setConfirmedBookingData({ booking: bookingConfirmation, guest: submittedData });
      setView('confirmed');
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
    },
    onError: (error: Error) => alert(`Błąd rezerwacji: ${error.message}`),
  });
  const handleClose = () => {
    onClose();
    setTimeout(() => { setView('form'); reset(); setConfirmedBookingData(null); }, 300);
  };
  useEffect(() => { if (isOpen) { setView('form'); } }, [isOpen]);
  if (!isOpen) { return null; }
  const handleFormSubmit: SubmitHandler<Inputs> = (data) => {
    if (!startTime) return;
    bookingMutation.mutate({ startTime: startTime.toISOString(), ...data });
  };
  const handleDownloadIcs = () => { if (!confirmedBookingData) return; downloadIcsFile(confirmedBookingData.booking, confirmedBookingData.guest); };
  
  return createPortal(
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {view === 'form' ? (
          <>
            <h2 className="modal-header">Potwierdź Rezerwację</h2>
            <p>Termin: <strong>{startTime?.toLocaleString('pl-PL')}</strong></p>
            <form className="modal-form" onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="form-group">
                  <label className="form-label">Imię i nazwisko</label>
                  <input {...register('guestName', {required: true})} className="form-input" />
              </div>
              <div className="form-group">
                  <label className="form-label">Adres email</label>
                  <input type="email" {...register('guestEmail', {required: true})} className="form-input" />
              </div>
              <div className="modal-actions">
                  <button type="button" onClick={handleClose} className="modal-button modal-button-secondary">Anuluj</button>
                  <button type="submit" disabled={bookingMutation.isPending} className="modal-button modal-button-primary">
                    {bookingMutation.isPending ? 'Rezerwuję...' : 'Zarezerwuj'}
                  </button>
              </div>
            </form>
          </>
        ) : (
          <div className="confirmation-view">
            <h2 className="confirmation-header">Rezerwacja udana!</h2>
            <p>Twoje spotkanie zostało potwierdzone.</p>
            <p>Termin: <strong>{new Date(confirmedBookingData!.booking.startTime).toLocaleString('pl-PL')}</strong></p>
            <div className="confirmation-actions">
                <button onClick={handleDownloadIcs} className="modal-button modal-button-primary">
                  Pobierz plik .ics
                </button>
                <button type="button" onClick={handleClose} className="modal-button modal-button-secondary">
                  Zamknij
                </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

const locales = { 'pl': pl };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const today = startOfToday();

export const BookingPage = () => {
  const { userId } = useParams<{ userId: string }>();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [view, setView] = useState<View>(Views.WEEK);

  const visibleDays = useMemo(() => {
    const startOfCalendarView = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const endOfCalendarView = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });

    switch (view) {
      case Views.MONTH:
        return eachDayOfInterval({ start: startOfCalendarView, end: endOfCalendarView });
      case Views.WEEK:
        return eachDayOfInterval({ start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: endOfWeek(currentDate, { weekStartsOn: 1 }) });
      case Views.DAY:
        return [currentDate];
      default:
        return [];
    }
  }, [currentDate, view]);

  const slotQueries = useQueries({
    queries: visibleDays.map(day => ({
      queryKey: ['availableSlots', userId, format(day, 'yyyy-MM-dd')],
      queryFn: () => getAvailableSlots(userId!, format(day, 'yyyy-MM-dd')),
      enabled: !!userId && !isBefore(day, today),
      staleTime: 1000 * 60 * 5, // Lepsza wydajność - dane są świeże przez 5 minut
    })),
  });
  
  // Uproszczone memoize - flatMap jest szybki, ale useMemo zapewnia, że referencja do `allAvailableSlots` nie zmienia się niepotrzebnie
  const allAvailableSlots = useMemo(() => 
    slotQueries.flatMap(query => query.data || [])
  , [slotQueries]);

  const events = useMemo(() => allAvailableSlots.map(slot => ({
    title: 'Wolny termin',
    start: slot,
    end: addMinutes(slot, 30),
  })), [allAvailableSlots]);

  const handleSelectSlot = (slot: BigCalendarEvent) => {
    if (slot.start && !isBefore(slot.start, new Date())) {
      setSelectedSlot(slot.start);
      setIsModalOpen(true);
    }
  };
  
  // Dodajemy zabezpieczenie na wypadek braku userId
  if (!userId) {
    return <div className="booking-page">Nieprawidłowy użytkownik.</div>;
  }

  return (
    <div className="booking-page">
      <div className="booking-container">
        <h1 className="booking-header">Zarezerwuj Termin</h1>
        <div className="calendar-wrapper">
          <Calendar
            localizer={localizer}
            events={events}
            onSelectEvent={handleSelectSlot}
            onNavigate={setCurrentDate}
            onView={setView}
            view={view}
            date={currentDate}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            startAccessor="start"
            endAccessor="end"
            culture="pl"
            messages={{ next: "Następny", previous: "Poprzedni", today: "Dziś", month: "Miesiąc", week: "Tydzień", day: "Dzień" }}
          />
        </div>
      </div>
      
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        startTime={selectedSlot}
        userId={userId} // userId jest już sprawdzone, więc nie potrzebujemy '!'
      />
    </div>
  );
};

// Funkcja pomocnicza pozostaje bez zmian
const formatToICSDate = (date: Date): string => {
  return date.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
};
const downloadIcsFile = (bookingData: BookingConfirmation, guestData: CreateBookingData) => {
  const { host } = bookingData;
  const icsContent = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CalX//Booking//EN', 'BEGIN:VEVENT', `UID:${bookingData.id}`, `DTSTAMP:${formatToICSDate(new Date())}`, `ORGANIZER;CN="${host.name}":mailto:${host.email}`, `DTSTART:${formatToICSDate(new Date(bookingData.startTime))}`, `DTEND:${formatToICSDate(new Date(bookingData.endTime))}`, `SUMMARY:Spotkanie z ${host.name}`, `DESCRIPTION:Potwierdzenie rezerwacji dla ${guestData.guestName}.`, `ATTENDEE;CN="${guestData.guestName}";ROLE=REQ-PARTICIPANT:mailto:${guestData.guestEmail}`, 'END:VEVENT', 'END:VCALENDAR'].join('\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'spotkanie.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};