import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { Readable } from 'stream';

const DEFAULT_PROXY_TIMEOUT_MS = 10000;
const MAX_ERROR_BODY_BYTES = 1024 * 1024;

function isStreamResponse(contentType: unknown): boolean {
  return typeof contentType === 'string' && (
    contentType.includes('text/event-stream') ||
    contentType.includes('application/x-ndjson') ||
    contentType.includes('stream')
  );
}

function requestExpectsStream(req: Request): boolean {
  const accept = req.headers.accept || '';
  return req.originalUrl.includes('/stream') || String(accept).includes('text/event-stream');
}

async function readStreamBody(stream: Readable, maxBytes = MAX_ERROR_BODY_BYTES): Promise<string> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;

    if (totalBytes > maxBytes) {
      chunks.push(buffer.subarray(0, Math.max(0, buffer.length - (totalBytes - maxBytes))));
      break;
    }

    chunks.push(buffer);
  }

  return Buffer.concat(chunks).toString('utf8');
}

function parseResponseBody(body: string, contentType: unknown, fallbackStatus: number, wrapText = false): unknown {
  if (!body) {
    return wrapText ? { code: fallbackStatus, message: 'Upstream service returned an empty response', data: null } : null;
  }

  if (typeof contentType === 'string' && contentType.includes('application/json')) {
    try {
      return JSON.parse(body);
    } catch {
      return wrapText ? { code: fallbackStatus, message: body, data: null } : body;
    }
  }

  try {
    return JSON.parse(body);
  } catch {
    return wrapText ? { code: fallbackStatus, message: body, data: null } : body;
  }
}

export function createProxy(serviceName: string, target: string) {
  return async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const url = `${target}${req.originalUrl}`;

      const headers: Record<string, string> = {
        'Content-Type': req.headers['content-type'] || 'application/json',
      };

      if (req.headers.authorization) {
        headers.Authorization = req.headers.authorization;
      }

      if ((req as any).user) {
        headers['X-User-Id'] = String((req as any).user.userId);
        headers['X-User-Role'] = (req as any).user.role;
        headers['X-Merchant-Id'] = String((req as any).user.merchantId);
      }

      const response = await axios({
        method: req.method as any,
        url,
        headers,
        data: req.body,
        timeout: requestExpectsStream(req) ? 0 : DEFAULT_PROXY_TIMEOUT_MS,
        responseType: 'stream',
        validateStatus: () => true,
      });

      const contentType = response.headers['content-type'];

      if (response.status < 200 || response.status >= 300) {
        const body = await readStreamBody(response.data);
        res.status(response.status).json(parseResponseBody(body, contentType, response.status, true));
        return;
      }

      if (isStreamResponse(contentType)) {
        res.status(response.status);
        if (typeof contentType === 'string') {
          res.setHeader('Content-Type', contentType);
        }
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        response.data.pipe(res);
        return;
      }

      const body = await readStreamBody(response.data);
      res.status(response.status).json(parseResponseBody(body, contentType, response.status));
    } catch (err: any) {
      if (err.response) {
        res.status(err.response.status).json(err.response.data);
      } else {
        console.error(`Proxy error for ${serviceName}:`, err.message);
        res.status(502).json({
          code: 502,
          message: `服务 ${serviceName} 暂时不可用`,
          data: null,
        });
      }
    }
  };
}
