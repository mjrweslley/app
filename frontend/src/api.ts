// frontend/src/api.ts
export * from './api/devices'
export * from './api/mappings'
export * from './api/rooms'
export { API_BASE_URL, request } from './api/client'

// Shim de compatibilidade — emula axios sem dependência extra
export const apiClient = {
  get: <T = unknown>(path: string) =>
    import('./api/client').then(({ request }) =>
      request<T>(path).then((data) => ({ data }))
    ),
  post: <T = unknown>(path: string, body?: unknown) =>
    import('./api/client').then(({ request }) =>
      request<T>(path, {
        method: 'POST',
        body: JSON.stringify(body),
      }).then((data) => ({ data }))
    ),
  patch: <T = unknown>(path: string, body?: unknown) =>
    import('./api/client').then(({ request }) =>
      request<T>(path, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }).then((data) => ({ data }))
    ),
  delete: <T = unknown>(path: string) =>
    import('./api/client').then(({ request }) =>
      request<T>(path, { method: 'DELETE' }).then((data) => ({ data }))
    ),
};