
import axios from "axios";
import { authClient } from "./auth-client";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://fixmate-server-qwhq.onrender.com/api",

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  // Let the browser set the multipart boundary for image uploads.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  try {
    const { data } = await authClient.token();

    if (data?.token) {
      config.headers.Authorization = `Bearer ${data.token}`;
    }
  } catch (error) {
    console.error("Unable to retrieve authentication token:", error);
  }

  return config;
});

export default api;
