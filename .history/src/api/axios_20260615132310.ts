import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // CRITICAL: sends httpOnly JWT cookie automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Toggle verbose logging in development or via env var VITE_VERBOSE_LOGS=true
const VERBOSE = Boolean(import.meta.env.DEV) || import.meta.env.VITE_VERBOSE_LOGS === 'true';

// ─── Request Interceptor (logging) ───────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (VERBOSE) {
      console.log('[api request]', {
        method: config.method,
        url: config.url,
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    if (VERBOSE) console.error('[api request error]', error);
    return Promise.reject(error);
  }
);

// ─── Response Interceptor (logging + auth handling) ───────────────────────────
api.interceptors.response.use(
  (response) => {
    if (VERBOSE) {
      console.log('[api response]', {
        url: response.config?.url,
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    if (VERBOSE) console.error('[api response error]', error);

    if (error.response?.status === 401) {
      // Dynamically import to avoid circular dependency with store
      import('../store/auth.store').then(({ useAuthStore }) => {
        useAuthStore.getState().clearUser();
      });

      const isAuthRoute = window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/signup');

      // Some requests are intentional silent auth checks (like getMe on app load).
      // In those cases, we should clear auth state but not force navigation.
      const skipAuthRedirect = (error.config as any)?.skipAuthRedirect;

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
