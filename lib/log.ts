// Structured logger — thin wrapper over pino
// Replace with import { pino } from 'pino' once installed

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug(msg: string, data?: Record<string, unknown>): void;
  info(msg: string, data?: Record<string, unknown>): void;
  warn(msg: string, data?: Record<string, unknown>): void;
  error(msg: string, data?: Record<string, unknown>): void;
}

function formatLog(level: LogLevel, msg: string, data?: Record<string, unknown>) {
  const entry = {
    level,
    time: new Date().toISOString(),
    msg,
    ...(data ?? {}),
  };
  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else {
    console[level](JSON.stringify(entry));
  }
}

export const logger: Logger = {
  debug: (msg, data) => formatLog('debug', msg, data),
  info: (msg, data) => formatLog('info', msg, data),
  warn: (msg, data) => formatLog('warn', msg, data),
  error: (msg, data) => formatLog('error', msg, data),
};
