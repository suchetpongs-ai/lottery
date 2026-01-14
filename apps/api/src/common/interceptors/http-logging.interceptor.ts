import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Inject,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, ip, body } = request;
        const userAgent = request.get('user-agent') || '';
        const now = Date.now();

        this.logger.log('info', `Incoming Request: ${method} ${url}`, {
            context: 'HTTP',
            method,
            url,
            ip,
            userAgent,
            body: this.sanitizeBody(body),
        });

        return next.handle().pipe(
            tap({
                next: (data) => {
                    const response = context.switchToHttp().getResponse();
                    const { statusCode } = response;
                    const delay = Date.now() - now;

                    this.logger.log('info', `Response: ${method} ${url} ${statusCode}`, {
                        context: 'HTTP',
                        method,
                        url,
                        statusCode,
                        delay: `${delay}ms`,
                    });
                },
                error: (error) => {
                    const delay = Date.now() - now;
                    this.logger.error(`Error: ${method} ${url}`, {
                        context: 'HTTP',
                        method,
                        url,
                        error: error.message,
                        stack: error.stack,
                        delay: `${delay}ms`,
                    });
                },
            }),
        );
    }

    private sanitizeBody(body: any): any {
        if (!body) return undefined;
        const sanitized = { ...body };
        // Remove sensitive fields
        delete sanitized.password;
        delete sanitized.confirmPassword;
        delete sanitized.passwordHash;
        return sanitized;
    }
}
