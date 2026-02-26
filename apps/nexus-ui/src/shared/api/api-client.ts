// apps/nexus-ui/src/shared/api/api-client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

export const api = {
  get: <T = unknown>(path: string): Promise<T> =>
    fetch(`${API_BASE}${path}`).then(r => r.json()),
};
