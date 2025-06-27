// App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { BookingPage } from './pages/BookingPage';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { LoginPage } from './pages/LoginPage'; 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext'; 
import { ProtectedRoute } from './components/ProtectedRoute'; 
import { RegisterPage } from './pages/RegisterPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/book/:userId" element={<BookingPage />} />
            <Route path="/" element={<div>Strona Główna - wybierz użytkownika</div>} />

            {}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;