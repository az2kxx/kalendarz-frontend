import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import type { Event as BigCalendarEvent, View } from 'react-big-calendar';
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parse, startOfWeek, getDay, eachDayOfInterval, endOfWeek, addMinutes, isBefore, startOfToday, startOfMonth, endOfMonth } from 'date-fns';
import { pl } from 'date-fns/locale/pl';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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
  const backdropStyle: React.CSSProperties = { position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, };
  const modalStyle: React.CSSProperties = { background: '#fff', color: '#000', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', };
  return createPortal(
    <div style={backdropStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {view === 'form' ? (
          <>
            <h2 style={{marginTop: 0}}>Potwierdź Rezerwację</h2>
            <p>Termin: <strong>{startTime?.toLocaleString('pl-PL')}</strong></p>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div style={{marginBottom: '1rem'}}>
                  <label style={{display: 'block', marginBottom: '4px'}}>Imię i nazwisko</label>
                  <input {...register('guestName', {required: true})} style={{width: 'calc(100% - 16px)', padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}} />
              </div>
              <div style={{marginBottom: '1rem'}}>
                  <label style={{display: 'block', marginBottom: '4px'}}>Adres email</label>
                  <input type="email" {...register('guestEmail', {required: true})} style={{width: 'calc(100% - 16px)', padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}} />
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem'}}>
                  <button type="button" onClick={handleClose} style={{padding: '10px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>Anuluj</button>
                  <button type="submit" disabled={bookingMutation.isPending} style={{padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
                    {bookingMutation.isPending ? 'Rezerwuję...' : 'Zarezerwuj'}
                  </button>
              </div>
            </form>
          </>
        ) : (
          <div>
            <h2 style={{marginTop: 0, color: '#16a34a'}}>Rezerwacja udana!</h2>
            <p>Twoje spotkanie zostało potwierdzone.</p>
            <p>Termin: <strong>{new Date(confirmedBookingData!.booking.startTime).toLocaleString('pl-PL')}</strong></p>
            <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem'}}>
                <button onClick={handleDownloadIcs} style={{padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
                  Pobierz plik .ics
                </button>
                <button type="button" onClick={handleClose} style={{padding: '10px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
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
    })),
  });
  
  const { data: allAvailableSlots } = useMemo(() => ({
    data: slotQueries.flatMap(query => query.data || [])
  }), [slotQueries]);

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
  
  return (
    <div style={{ padding: '1rem', background: '#f3f4f6' }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '1.5rem', color: '#111827' }}>Zarezerwuj Termin</h1>
        <div style={{ height: '80vh', background: 'white', color: 'black', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
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
        userId={userId!}
      />
    </div>
  );
};

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

