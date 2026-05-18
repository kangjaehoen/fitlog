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
  const headers = new Headers(init?.headers);
  const isFormData =
    typeof FormData !== "undefined" && init?.body instanceof FormData;
  if (!headers.has("Content-Type") && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
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
  postForm<T>(path: string, body: FormData, options?: MutationOptions) {
    return request<T>(path, {
      ...options,
      body,
      method: "POST",
    });
  },
  patch<T>(path: string, body?: unknown, options?: MutationOptions) {
    return request<T>(path, {
      ...options,
      body: body === undefined ? undefined : JSON.stringify(body),
      method: "PATCH",
    });
  },
  delete<T>(path: string, body?: unknown, options?: MutationOptions) {
    return request<T>(path, {
      ...options,
      body: body === undefined ? undefined : JSON.stringify(body),
      method: "DELETE",
    });
  },
};

export function buildApiAssetUrl(path?: string | null) {
  if (!path) {
    return null;
  }
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }

  return buildUrl(path);
}
