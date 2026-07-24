import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter';
import { useMe } from './hooks/useAuth';

/**
 * Bootstraps the authenticated user into Zustand on app load.
 * Runs once — if the JWT cookie is valid the user is populated,
 * if not (401) the interceptor clears auth silently.
 */
const AuthBootstrap = () => {
  useMe();
  return null;
};

const App = () => {
  // Apply Poppins font from Google Fonts via a <link> injected once
  useEffect(() => {
    const existing = document.getElementById('khenx-font');
    if (existing) return;

    const link = document.createElement('link');
    link.id = 'khenx-font';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <>
      {/* Silently resolve the current user on mount */}
      <AuthBootstrap />

      {/* All routes */}
      <AppRouter />
z
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            borderRadius: '10px',
            background: '#0F172A',
            color: '#F8FAFC',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#00C9A7',
              secondary: '#0F172A',
            },
          },
          error: {
            iconTheme: {
              primary: '#DC2626',
              secondary: '#F8FAFC',
            },
          },
        }}
      />
    </>
  );
};

export default App;
