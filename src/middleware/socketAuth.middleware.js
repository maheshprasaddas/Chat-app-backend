import jwt from "jsonwebtoken";
const { verify } = jwt;

/**
 * Socket.IO authentication middleware.
 * Verifies the JWT sent during the handshake and attaches
 * the decoded user payload to `socket.user`.
 *
 * Clients should connect with:
 *   io("http://...", { auth: { token: "<accessToken>" } })
 */
const socketAuthMiddleware = (socket, next) => {
  try {
    // 1) Prefer auth payload (real clients: io({ auth: { token } }))
    // 2) Fallback to Authorization header (Postman / HTTP clients)
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Access token missing"));
    }

    const decoded = verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Attach authenticated user info to the socket instance
    socket.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new Error("Token expired"));
    }

    return next(new Error("Invalid token"));
  }
};

export default socketAuthMiddleware;
