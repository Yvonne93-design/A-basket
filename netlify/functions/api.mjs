// Reuse the validated hosting gateway; credentials stay in server environment variables.
import worker from '../../dist/server/index.js';

export default (request, context) => {
  const headers = new Headers(request.headers);
  headers.set('CF-Connecting-IP', context.ip || 'unknown');
  return worker.fetch(new Request(request, {headers}), process.env);
};

export const config = {path: ['/healthz', '/api/*']};
