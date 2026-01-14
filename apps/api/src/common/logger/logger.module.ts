import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, context, stack }) => {
        const contextStr = context ? `[${context}]` : '';
        const stackStr = stack ? `\n${stack}` : '';
        return `${timestamp} ${level} ${contextStr} ${message}${stackStr}`;
    }),
);

@Global()
@Module({
    imports: [
        WinstonModule.forRoot({
            transports: [
                // Console transport for development
                new winston.transports.Console({
                    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
                    format: consoleFormat,
                }),
                // File transport for errors
                new winston.transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                    format: logFormat,
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
                // File transport for all logs
                new winston.transports.File({
                    filename: 'logs/combined.log',
                    format: logFormat,
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
            ],
        }),
    ],
    exports: [WinstonModule],
})
export class LoggerModule { }
