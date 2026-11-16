import type { Dream, NewDream } from "../../shared/types";

// One place that knows where the API lives. Set VITE_API_URL in client/.env
// for deploys; falls back to the local server in development.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// App gives us Clerk's getToken once it's mounted.
let getToken: () => Promise<string | null> = async () => null;

export function setTokenGetter(fn: () => Promise<string | null>) {
  getToken = fn;
}

// Every request goes through here so a failed response (4xx/5xx) always
// throws, instead of being parsed as if it were a dream.
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export const getDreams = () => request<Dream[]>("/dreams");

export const getDream = (id: string) => request<Dream>(`/dreams/${id}`);

export const createDream = (dream: NewDream) =>
  request<Dream>("/dreams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dream),
  });

export const requestReading = (id: string) =>
  request<Dream>(`/dreams/${id}/reading`, { method: "POST" });