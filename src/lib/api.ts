import axios from "axios";
import { clearToken, getToken } from "./auth";

export const baseURL = process.env.NEXT_PUBLIC_API_BASE || "https://troca-numeros-api-production.up.railway.app";

export const api = axios.create({
  baseURL,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use((response) => response, (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/login")) clearToken();
  return Promise.reject(error);
});

export function apiError(error: unknown, fallback = "Não foi possível concluir. Tente novamente.") {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    if (!error.response) return "Sem conexão com o servidor. Verifique sua internet e tente novamente.";
    return error.response.data?.error || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
