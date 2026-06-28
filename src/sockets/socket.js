// Singleton holder for the Socket.IO server instance
// Allows controllers (REST layer) to emit real-time notifications

let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.IO not initialized — call setIO(io) first");
  }
  return ioInstance;
};
