import { QueryClient } from "@tanstack/react-query";

async function throwError(response: Response): Promise<never> {
  let errorMessage = `Error: ${response.status} ${response.statusText}`;
  
  try {
    const body = await response.json();
    errorMessage = body.message || body.error || errorMessage;
  } catch {
    // Couldn't parse error message
  }
  
  throw new Error(errorMessage);
}

async function defaultFetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  
  if (!response.ok) {
    await throwError(response);
  }
  
  return response.json();
}

async function apiRequest<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    await throwError(response);
  }

  return response.json();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        return defaultFetcher(url);
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
});

export { apiRequest };
