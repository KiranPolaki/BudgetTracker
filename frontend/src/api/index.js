import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const requestTimeouts = new Map();

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  const timeoutId = setTimeout(() => {
    const toastId = toast.loading("Please wait...");
    requestTimeouts.set(config.url + config.method, toastId);
  }, 5000);

  config.timeoutHandler = timeoutId;

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (response.config.timeoutHandler) {
      clearTimeout(response.config.timeoutHandler);
    }
    const toastId = requestTimeouts.get(
      response.config.url + response.config.method
    );
    if (toastId) {
      toast.dismiss(toastId);
      requestTimeouts.delete(response.config.url + response.config.method);
    }
    return response;
  },
  (error) => {
    if (error.config?.timeoutHandler) {
      clearTimeout(error.config.timeoutHandler);
    }
    const toastId = requestTimeouts.get(
      error.config?.url + error.config?.method
    );
    if (toastId) {
      toast.dismiss(toastId);
      requestTimeouts.delete(error.config?.url + error.config?.method);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
