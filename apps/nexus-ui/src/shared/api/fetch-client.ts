// apps/nexus-ui/src/shared/api/fetch-client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

export const apiClient = {
  get: <T = unknown>(path: string): Promise<T> =>
    fetch(`${API_BASE}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }).then(r => r.json()),
};
