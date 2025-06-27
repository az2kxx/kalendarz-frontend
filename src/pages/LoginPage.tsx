
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser } from '../api/auth';
import type { LoginData } from '../api/auth';
import { useAuth } from '../hooks/useAuth'; 

export const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const from = location.state?.from?.pathname || "/dashboard";

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
        login(data.token, { userId: data.userId, name: data.name });
        navigate(from, { replace: true });
    },
    onError: (error) => {
      console.error("Logowanie nieudane:", error);
      alert(`Logowanie nieudane: Sprawdź dane i spróbuj ponownie.`);
    },
  });

  const onSubmit: SubmitHandler<LoginData> = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">Zaloguj się</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              {...register('password', { required: 'Hasło jest wymagane' })}
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
              {mutation.isPending ? 'Logowanie...' : 'Zaloguj się'}
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Nie masz jeszcze konta?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Zarejestruj się
          </Link>
        </p>
      </div>
    </div>
  );
};