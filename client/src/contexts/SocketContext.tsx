import { createContext, useContext, useEffect, useRef } from "react";
import type { FC, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { storage } from "../helpers/Storage";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = storage.getToken();

    if (!token) return;

    // 👉 konekcija sa backendom
    socketRef.current = io("http://localhost:5000", {
      auth: {
        token: token, // JWT ide ovde
      },
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("🟢 Socket connected:", socketRef.current?.id);
    });

    socketRef.current.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocketContext must be used inside SocketProvider");
  }
  return ctx;
};