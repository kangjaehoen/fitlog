const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  "http://localhost:8080";

type RequestOptions = Omit<RequestInit, "method">;
type MutationOptions = Omit<RequestInit, "body" | "method">;

function buildUrl(path: string) {
  return path.startsWith("http")
    ? path
    : new URL(path, API_BASE_URL).toString();
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions) {
    return request<T>(path, {
      ...options,
      method: "GET",
    });
  },
  post<T>(path: string, body?: unknown, options?: MutationOptions) {
    return request<T>(path, {
      ...options,
      body: body === undefined ? undefined : JSON.stringify(body),
      method: "POST",
    });
  },
};
