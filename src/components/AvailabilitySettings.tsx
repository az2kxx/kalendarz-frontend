import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { fetchAvailability, updateAvailability } from '../api/availability';
import type { UpdateAvailabilityPayload, AvailabilitySetting } from '../api/availability';

const daysOfWeek = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];

type FormValues = {
  availability: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  }[];
};

export const AvailabilitySettings = () => {
  const queryClient = useQueryClient();
  
  const { data: currentAvailability, isLoading } = useQuery({
    queryKey: ['availability'],
    queryFn: fetchAvailability,
    select: (data: AvailabilitySetting[]): FormValues['availability'] => {
      const settings = Array(7).fill(null).map(() => ({ enabled: false, startTime: '09:00', endTime: '17:00' }));
      data.forEach(item => {
        if (item.dayOfWeek >= 0 && item.dayOfWeek < 7) {
            settings[item.dayOfWeek] = { enabled: true, startTime: item.startTime, endTime: item.endTime };
        }
      });
      return settings;
    },
    initialData: [], 
  });
  
  const { register, control, handleSubmit, watch } = useForm<FormValues>({
    values: { availability: currentAvailability || [] }
  });

  const { fields } = useFieldArray({
    control,
    name: "availability",
  });

  const mutation = useMutation({
    mutationFn: (settings: { availabilities: UpdateAvailabilityPayload }) => updateAvailability(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      alert('Ustawienia dostępności zostały zaktualizowane!');
    },
    onError: (error) => {
      alert(`Wystąpił błąd podczas zapisywania: ${error.message}`);
    }
  });

  const onSubmit = (data: FormValues) => {
    const apiData: UpdateAvailabilityPayload = data.availability
      .map((day, index) => ({...day, dayOfWeek: index}))
      .filter(day => day.enabled)
      .map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime }));
      
    mutation.mutate({ availabilities: apiData });
  };
  
  if (isLoading) {
    return <div className="p-6 text-center">Ładowanie ustawień dostępności...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Ustawienia Dostępności</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Zdefiniuj swoje standardowe godziny pracy. Na tej podstawie system będzie generował wolne terminy dla Twoich klientów.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field, index) => {
            const isEnabled = watch(`availability.${index}.enabled`);
            return (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 p-3 rounded-md border border-gray-200 dark:border-gray-700 rounded-lg
">
                    <div className="md:col-span-1 flex items-center">
                        <input
                            type="checkbox"
                            {...register(`availability.${index}.enabled`)}
                            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {daysOfWeek[index]}
                        </label>
                    </div>
                    <div className={`md:col-span-3 grid grid-cols-2 gap-4 transition-opacity ${isEnabled ? 'opacity-100' : 'opacity-50'}`}>
                        <div>
                            <label htmlFor={`start-time-${index}`} className="text-xs text-gray-500">Początek</label>
                            <input
                                id={`start-time-${index}`}
                                type="time"
                                {...register(`availability.${index}.startTime`)}
                                disabled={!isEnabled}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label htmlFor={`end-time-${index}`} className="text-xs text-gray-500">Koniec</label>
                            <input
                                id={`end-time-${index}`}
                                type="time"
                                {...register(`availability.${index}.endTime`)}
                                disabled={!isEnabled}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>
            )
        })}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {mutation.isPending ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
        </div>
      </form>
    </div>
  );
};