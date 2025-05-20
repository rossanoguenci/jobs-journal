const isDev = process.env.NODE_ENV === 'development';

type LogMethod = 'log' | 'debug' | 'info' | 'warn' | 'error';

const baseLog = (
    type: LogMethod,
    label: string,
    style: string,
    ...args: unknown[]
) => {
    if (!isDev) return;
    console[type](`%c[${label}]`, style, ...args);
};

// Styled loggers
export const debugLog = (...args: unknown[]) =>
    baseLog('debug', 'debug', 'color: #6b7280;', ...args); // grey

export const infoLog = (...args: unknown[]) =>
    baseLog('info', 'info', 'color: #0ea5e9;', ...args); // blue

export const warnLog = (...args: unknown[]) =>
    baseLog('warn', 'warn', 'color: #f59e0b; font-weight: bold;', ...args); // orange

export const errorLog = (...args: unknown[]) =>
    baseLog('error', 'error', 'color: #ef4444; font-weight: bold;', ...args); // red
