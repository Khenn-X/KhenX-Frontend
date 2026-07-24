import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // CRITICAL: sends httpOnly JWT cookie automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Response Interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      // Dynamically import to avoid circular dependency with store
      import('../store/auth.store').then(({ useAuthStore }) => {
        useAuthStore.getState().clearUser();
      });

      const isAuthRoute = window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/signup');

      // Some requests are intentional silent auth checks (like getMe on app load).
      // In those cases, we should clear auth state but not force navigation.
      const skipAuthRedirect = error.config?.headers?.['x-skip-auth-redirect'];

      if (!isAuthRoute && !skipAuthRedirect) {
        window.location.href = '/login';
      }
    }

    // Extract backend error message or fall back to generic
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';

    return Promise.reject(new Error(message));
  }
);

export default api;
