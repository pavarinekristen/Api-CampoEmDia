import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = isHttpException
      ? exception.getResponse()
      : { message: 'Erro interno inesperado.' };

    if (!isHttpException) {
      // Erros não tratados são logados com stack completo — nunca vazam
      // detalhe interno para o cliente.
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    }

    response.status(status).json(
      typeof body === 'string' ? { message: body, statusCode: status } : { ...body, statusCode: status },
    );
  }
}
