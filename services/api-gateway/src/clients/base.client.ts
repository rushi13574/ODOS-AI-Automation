/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { HttpService } from '@nestjs/axios';
import type { Request } from 'express';
import { AxiosRequestConfig } from 'axios';
import { catchError, timeout, firstValueFrom } from 'rxjs';
import {
  InternalServerErrorException,
  Logger,
  BadGatewayException,
  GatewayTimeoutException,
} from '@nestjs/common';

export abstract class BaseServiceClient {
  protected abstract readonly logger: Logger;
  protected abstract readonly baseUrl: string;
  protected readonly defaultTimeout = 10000; // 10 seconds

  constructor(protected readonly httpService: HttpService) {}

  protected getHeaders(req?: Request): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (req) {
      if ((req as any)['correlationId']) {
        headers['x-correlation-id'] = (req as any)['correlationId'];
      }
      if ((req as any)['userId']) {
        headers['x-user-id'] = (req as any)['userId'];
      }
    }

    return headers;
  }

  protected async get<T>(
    url: string,
    req?: Request,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>('get', url, undefined, req, config);
  }

  protected async post<T>(
    url: string,
    data?: any,
    req?: Request,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>('post', url, data, req, config);
  }

  protected async put<T>(
    url: string,
    data?: any,
    req?: Request,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>('put', url, data, req, config);
  }

  protected async delete<T>(
    url: string,
    req?: Request,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>('delete', url, undefined, req, config);
  }

  private async request<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any,
    req?: Request,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const fullUrl = `${this.baseUrl}${url}`;
    const headers = { ...this.getHeaders(req), ...(config?.headers || {}) };
    const timeoutMs = config?.timeout || this.defaultTimeout;

    const requestConfig: AxiosRequestConfig = {
      ...config,
      method,
      url: fullUrl,
      data,
      headers,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.request<T>(requestConfig).pipe(
          timeout(timeoutMs),
          catchError((error) => {
            if (error.name === 'TimeoutError') {
              throw new GatewayTimeoutException(
                `Service timeout: ${this.constructor.name} - ${url}`,
              );
            }
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error: any) {
      if (error instanceof GatewayTimeoutException) {
        throw error;
      }

      this.logger.error(
        `Request to ${fullUrl} failed: ${error.message}`,
        error.stack,
      );

      if (error.response) {
        // Propagate the specific downstream status/message
        throw new BadGatewayException({
          message: error.response.data?.message || 'Downstream service error',
          downstreamStatus: error.response.status,
          service: this.constructor.name,
        });
      }

      throw new InternalServerErrorException(
        `Failed to communicate with ${this.constructor.name}`,
      );
    }
  }
}
