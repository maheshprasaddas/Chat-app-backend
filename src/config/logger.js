import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

const logger = pino({
  level: isProduction ? "info" : "debug",

  // Human-readable logs in dev, structured JSON in production
  ...(!isProduction && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  }),
});

export default logger;
