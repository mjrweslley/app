// Native Expo uses the configured LAN URL. The Docker web build uses the same-origin /api proxy.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://smarthub.local:8080/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const base = API_BASE_URL.replace(/\/$/, '')
  const route = path.startsWith('/') ? path : `/${path}`
  const res = await fetch(`${base}${route}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(body || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}
export { API_BASE_URL, request }
