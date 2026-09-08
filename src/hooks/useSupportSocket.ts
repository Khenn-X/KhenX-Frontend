import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';

let sharedSocket: Socket | null = null;
let socketUsers = 0;

const getSocketUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return import.meta.env.VITE_SOCKET_URL || apiUrl.replace(/\/api\/?$/, '');
};

const acquireSocket = (): Socket => {
  if (!sharedSocket) {
    sharedSocket = io(getSocketUrl(), { withCredentials: true });
  }
  socketUsers += 1;
  return sharedSocket;
};

const releaseSocket = (socket: Socket): void => {
  socketUsers = Math.max(0, socketUsers - 1);
  if (socketUsers === 0 && sharedSocket === socket) {
    socket.disconnect();
    sharedSocket = null;
  }
};

export const useSupportSocket = (): Socket | null => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setSocket(null);
      return undefined;
    }

    const activeSocket = acquireSocket();
    setSocket(activeSocket);

    return () => {
      releaseSocket(activeSocket);
      setSocket(null);
    };
  }, [isAuthenticated]);

  return socket;
};
