import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

/**
 * Attach access token to authenticated requests.
 */
api.interceptors.request.use(
  (config) => {
    // =====================================================
    // ACCESS TOKEN
    // =====================================================

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // =====================================================
    // CONTENT TYPE
    // =====================================================

    /**
     * If sending FormData:
     *
     * DO NOT manually set Content-Type.
     *
     * Axios/browser will automatically set:
     *
     * multipart/form-data;
     * boundary=----------------...
     */
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

export default api;