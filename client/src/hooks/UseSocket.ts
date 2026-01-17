import { useSocketContext } from "../contexts/SocketContext";

export const useSocket = () => {
  const { socket } = useSocketContext();

  const emit = (event: string, payload?: any) => {
    socket?.emit(event, payload);
  };

  const on = (event: string, callback: (data: any) => void) => {
    socket?.on(event, callback);
  };

  const off = (event: string) => {
    socket?.off(event);
  };

  return {
    socket,
    emit,
    on,
    off,
    connected: socket?.connected ?? false,
  };
};