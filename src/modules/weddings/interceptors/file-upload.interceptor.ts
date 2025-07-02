import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Se há arquivos no request, processar
        const request = context.switchToHttp().getRequest();
        if (request.files || request.file) {
          return {
            ...data,
            uploadedFiles: request.files || [request.file],
          };
        }
        return data;
      }),
    );
  }
}
