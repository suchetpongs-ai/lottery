import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Note: Rate limiting should be implemented using @nestjs/throttler instead

// Note: Rate limiting should be implemented using @nestjs/throttler instead

/* TODO: Implement using @nestjs/throttler
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per windowMs
    message: 'Too many login attempts, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many requests, please slow down',
    standardHeaders: true,
    legacyHeaders: false,
});
*/

// CORS configuration for production
export const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL]
        : ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
};

// Security headers middleware
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Prevent XSS attacks
        res.setHeader('X-XSS-Protection', '1; mode=block');

        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'DENY');

        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');

        // Referrer policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Content Security Policy
        res.setHeader(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        );

        next();
    }
}
