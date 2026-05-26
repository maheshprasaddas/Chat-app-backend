import { sign } from "jsonwebtoken";

const generateAccessToken = (payload) => {
  return sign(
    payload,
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "15m",
    }
  );
};

const generateRefreshToken = (payload) => {
  return sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d",
    }
  );
};

export default {
  generateAccessToken,
  generateRefreshToken,
};