// Reuse the validated hosting gateway; credentials stay in server environment variables.
import worker from '../../dist/server/index.js';

// Netlify can inject its own OPENAI_API_KEY; use explicit Yilan credentials only.
const env = {
  OPENAI_API_KEY: process.env.YILAN_AI_API_KEY || '',
  OPENAI_BASE_URL: process.env.YILAN_AI_BASE_URL || 'https://api.deepseek.com',
  OPENAI_MODEL: process.env.YILAN_AI_MODEL || 'deepseek-flash',
};

export default (request, context) => {
  const headers = new Headers(request.headers);
  headers.set('CF-Connecting-IP', context.ip || 'unknown');
  return worker.fetch(new Request(request, {headers}), env);
};

export const config = {path: ['/healthz', '/api/*']};
