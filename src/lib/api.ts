import axios from "axios";
import { getToken } from "./auth";

const baseURL = "https://troca-numeros-api-production.up.railway.app";

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
