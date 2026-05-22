const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface FetcherError {
  status: number;
  detail: any;
}

export async function fetcher<T>(
  path: string,
  options?: RequestInit,
  token?: string | null
): Promise<T> {
  const headers = new Headers(options?.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  // Auto set content-type to JSON if standard body object
  if (options?.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${BASE_URL}${cleanPath}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail: any = "API request failed";
    try {
      errorDetail = await response.json();
    } catch (_) {
      try {
        errorDetail = await response.text();
      } catch (__) {}
    }
    
    throw {
      status: response.status,
      detail: errorDetail,
    } as FetcherError;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
