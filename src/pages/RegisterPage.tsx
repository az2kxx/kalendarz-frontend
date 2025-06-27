import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth';
import type { RegisterData } from '../api/auth'; 

export const RegisterPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterData>();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      alert(data.message); 
      navigate('/login'); 
    },
    onError: (error) => {
      alert(`Rejestracja nieudana: ${error.message}`);
    },
  });

  const onSubmit: SubmitHandler<RegisterData> = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">Zarejestruj się</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Imię i nazwisko</label>
            <input
              {...register('name', { required: 'Imię jest wymagane' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email jest wymagany' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hasło</label>
            <input
              type="password"
              {...register('password', { required: 'Hasło jest wymagane', minLength: { value: 6, message: 'Hasło musi mieć co najmniej 6 znaków' } })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {mutation.isPending ? 'Rejestrowanie...' : 'Zarejestruj się'}
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Masz już konto?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
};