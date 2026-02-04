/**
 * Cloudflare Workers Entry Point for KDS Backend API
 * This adapts the NestJS application to run on Cloudflare Workers
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../apps/api-gateway/src/app.module';

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  DOCUMENTS: R2Bucket;
  NODE_ENV: string;
  API_PREFIX: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
}

let app: any = null;

async function initializeApp(env: Env) {
  if (!app) {
    // Set environment variables for NestJS
    process.env.NODE_ENV = env.NODE_ENV || 'production';
    process.env.API_PREFIX = env.API_PREFIX || 'api/v1';
    process.env.JWT_SECRET = env.JWT_SECRET;
    process.env.JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;

    app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn'],
    });

    app.enableCors({
      origin: true,
      credentials: true,
    });

    app.setGlobalPrefix(env.API_PREFIX);

    await app.init();
  }
  return app;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const nestApp = await initializeApp(env);

      // Convert Cloudflare Request to Node.js compatible request
      const url = new URL(request.url);
      const path = url.pathname + url.search;

      // Get the Express adapter
      const httpAdapter = nestApp.getHttpAdapter();
      const instance = httpAdapter.getInstance();

      // Create a promise to handle the response
      return new Promise((resolve) => {
        const req = {
          method: request.method,
          url: path,
          headers: Object.fromEntries(request.headers.entries()),
          body: request.body,
        };

        const res = {
          statusCode: 200,
          headers: {} as Record<string, string>,
          body: '',
          setHeader: (key: string, value: string) => {
            res.headers[key] = value;
          },
          status: (code: number) => {
            res.statusCode = code;
            return res;
          },
          send: (data: any) => {
            res.body = typeof data === 'string' ? data : JSON.stringify(data);
            resolve(
              new Response(res.body, {
                status: res.statusCode,
                headers: res.headers,
              })
            );
          },
          json: (data: any) => {
            res.headers['Content-Type'] = 'application/json';
            res.send(data);
          },
        };

        // Handle the request
        instance.handle(req, res);
      });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
