const env = ((import.meta as any).env || {}) as Record<string, string | undefined>;

function readEnv(name: string, fallback: string) {
  const value = env[name]?.trim();
  return value || fallback;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export const API_BASE_URL = trimTrailingSlash(
  readEnv('VITE_MINIAPP_API_BASE_URL', 'http://127.0.0.1:3000/api'),
);

export const LIVE2D_H5_URL = readEnv(
  'VITE_MINIAPP_LIVE2D_H5_URL',
  'http://127.0.0.1:5173/live2d/index.html',
);

export const VOICE_API_BASE_URL = trimTrailingSlash(
  readEnv('VITE_MINIAPP_VOICE_API_BASE_URL', 'http://127.0.0.1:8000'),
);
