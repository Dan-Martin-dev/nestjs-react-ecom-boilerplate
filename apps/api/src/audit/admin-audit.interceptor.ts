import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditService } from './audit.service';
import { Role } from '@repo/db';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestWithUser extends Request {
  user: {
    id: string;
    role: Role;
  };
  method: HttpMethod;
  path: string;
  ip: string;
  headers: Record<string, string>;
  body: unknown;
}

@Injectable()
export class AdminAuditInterceptor implements NestInterceptor {
  private readonly methodToAction: Record<HttpMethod, string> = {
    POST: 'CREATE',
    PUT: 'UPDATE',
    PATCH: 'UPDATE',
    DELETE: 'DELETE',
    GET: 'READ',
  };

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { user, method, path } = request;

    // Only audit admin actions
    if (user?.role !== Role.ADMIN) {
      return next.handle();
    }

    const action = this.methodToAction[method];
    if (!action) {
      return next.handle();
    }

    // Extract entity type from path (e.g., /api/products/123 -> products)
    const pathParts = path.split('/').filter(Boolean);
    const entityType = pathParts[1] || 'unknown'; // Skip 'api' prefix if present
    const entityId = pathParts[2] || 'unknown';

    return next.handle().pipe(
      tap((response) => {
        // We need to wrap the async operation in a Promise that we don't await
        // This prevents issues with the Observable chain
        void this.logAuditEvent({
          request,
          response,
          context,
          action,
          entityType,
          entityId,
        });
      }),
    );
  }

  private async logAuditEvent({
    request,
    response,
    context,
    action,
    entityType,
    entityId,
  }: {
    request: RequestWithUser;
    response: unknown;
    context: ExecutionContext;
    action: string;
    entityType: string;
    entityId: string;
  }): Promise<void> {
    await this.auditService.log({
      action: `${action}_${entityType.toUpperCase()}`,
      entityType,
      entityId: entityId === 'unknown' ? 'multiple' : entityId,
      userId: request.user.id,
      details: {
        method: request.method,
        path: request.path,
        requestBody: request.body,
        responseStatus: context
          .switchToHttp()
          .getResponse<{ statusCode: number }>().statusCode,
        responseBody: response,
      },
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });
  }
}
